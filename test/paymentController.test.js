require('dotenv').config();

const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const axiosMockAdapter = require('axios-mock-adapter');
const app = require('../server.js'); // Adjust the path to your app.js file
const { authenticateToken } = require('../middleware/middle'); // Import middleware

const { expect } = chai;
chai.use(chaiHttp);

describe('payment Controller', () => {
    let axiosMock;
    let mockToken;

    before(() => {
        // Initialize axios-mock-adapter
        axiosMock = new axiosMockAdapter(axios);

        // Generate a valid JWT token
        mockToken = jwt.sign({ email: 'test@test.com', name: 'test' }, '0501xwf0', { expiresIn: '24h' });

    });

    beforeEach(() => {
        sinon.stub(jwt, 'verify').callsFake((token, secret) => {
            if (token == mockToken && secret == '0501xwf0') {
                return { email: 'test@test.com', name: 'test' }; // Simulated valid payload
            }
            throw new Error('Invalid token'); // Simulated error for invalid tokens

        });

        // Stub jwt.sign to always return the same token
        sinon.stub(jwt, 'sign').returns(mockToken);

    });

    afterEach(() => {
        sinon.restore();
        axiosMock.reset();
    });

    after(() => {

        axiosMock.restore();
    });



    describe('Protected Routes', () => {
        describe('getPaymentsByEmail', () => {
            it('should return 400 if email is missing', (done) => {
                chai
                    .request(app)
                    .post('/api/payments/email')
                    .set('Authorization', `Bearer ${mockToken}`) // Include valid token
                    .send({  }) // Missing email
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property('error', 'Please provide an email in the request body.');

                        done();
                    });
            });

            it('should return 200 and payment list', async () => {
                axiosMock.onPost(`${process.env.BASE_URL}/payments_by_email`).reply(200, {
                    result: {
                        Payments: [
                            {
                                id: '5',
                                name: 'PBNK1/2024/00003',
                                contract: 'Rent003',
                                amount_notax: 1080.0,
                                amount_total: 1286.2,
                                date: '2024-11-30',
                                journal: 'Bank'
                            }]

                    },
                });

                const res = await chai
                    .request(app)
                    .post('/api/payments/email')
                    .set('Authorization', `Bearer ${mockToken}`) // Include valid token
                    .send({ email: 'test@test.com' });

                expect(res).to.have.status(200);
                expect(res.body.result).to.have.property('Payments');
            });
        });

        
        describe('Error 500', () => {
            it('should return 500 if the server encounters an error', async () => {
                axiosMock.onPost(`${process.env.BASE_URL}/payments_by_email`).reply(500, {
                    error: 'Internal Server Error'
                });

                const res = await chai
                    .request(app)
                    .post('/api/payments/email')
                    .set('Authorization', `Bearer ${mockToken}`) // Include valid token
                    .send({ email: 'test@test.com' });

                expect(res).to.have.status(500);
                expect(res.body).to.have.property('error');
            });
        });
    });
});
