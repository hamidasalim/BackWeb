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

describe('Contract Controller', () => {
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
        describe('getContractssByEmail', () => {
            it('should return 400 if email is missing', (done) => {
                chai
                    .request(app)
                    .post('/api/contracts/email')
                    .set('Authorization', `Bearer ${mockToken}`) // Include valid token
                    .send({}) // Missing email
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property('error', 'Please provide an email in the request body.');

                        done();
                    });
            });

            it('should return 200 and contract list', async () => {
                axiosMock.onPost(`${process.env.BASE_URL}/contracts_by_email`).reply(200, {
                    result: {
                        contracts: [
                            {
                                id: 11,
                                name: 'Rent001',
                                state: 'cancel',
                                rent_start_date: '2020-11-30 10:00:00',
                                rent_end_date: '2020-12-01 10:00:00',
                                vehicle: 'Audi/A1/10001',
                                total_cost: 165.0
                            }]

                    },
                });

                const res = await chai
                    .request(app)
                    .post('/api/contracts/email')
                    .set('Authorization', `Bearer ${mockToken}`) // Include valid token
                    .send({ email: 'test@test.com' });

                expect(res).to.have.status(200);
                expect(res.body.result).to.have.property('contracts');
            });
        });
        describe('createContract', () => {
            it('should return 400 if a field is missing', (done) => {
                chai
                    .request(app)
                    .post('/api/contracts/create')
                    .set('Authorization', `Bearer ${mockToken}`) // Include valid token
                    .send({}) // Missing email
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property('error', 'Please provide email, car_id, start_date, and end_date.');

                        done();
                    });
            });

            it('should return 200 and create a contract successfully', (done) => {
                axiosMock.onPost(`${process.env.BASE_URL}/create_contract_user`).reply(200, {
                    result: {
                        message: "Contract created successfully!",
                        contract_id: 83,
                        contract_name: "Rent004"

                    },
                });
                axiosMock.onPost(`${process.env.BASE_URL}/create_payment_user`).reply(200, {
                    result: {
                        message: 'Payment created  successfully!',
                        payment_id: 55,
                        contract: 'Rent004',

                    },
                });
                chai
                    .request(app)
                    .post('/api/contracts/create')
                    .set('Authorization', `Bearer ${mockToken}`) // Include valid token
                    .send({
                        email: 'testuser@example.com',
                        car_id: 'car123',
                        start_date: '2024-12-01',
                        end_date: '2024-12-10',
                        fuel_level: '1/2',
                    }) // Send all required fields
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.have.property('message', 'Contract created successfully!');
                        expect(res.body).to.have.property('contract');
                        done();
                    });
            });

        });

        describe('Cancel contract', () => {
            it('should return 201 and cancel contract', async () => {
                axiosMock.onPost(`${process.env.BASE_URL}/cancel_contract_user`).reply(200, {
                    result: {
                        message: "Contract annulé successfully!",
                        contract_name: "4485",
                        contract_state: "cancel"

                    },
                });

                const res = await chai
                    .request(app)
                    .post('/api/contracts/cancel')
                    .set('Authorization', `Bearer ${mockToken}`) // Include valid token
                    .send({
                        email: 'test@test.com', contract_id: "48"
                    });

                expect(res).to.have.status(201);
                expect(res.body.result).to.have.property("message", "Contract annulé successfully!"
                );
            });
        });


        describe('Error 500', () => {
            it('should return 500 if the server encounters an error', async () => {
                axiosMock.onPost(`${process.env.BASE_URL}/contracts_by_email`).reply(500, {
                    error: 'Internal Server Error'
                });

                const res = await chai
                    .request(app)
                    .post('/api/contracts/email')
                    .set('Authorization', `Bearer ${mockToken}`) // Include valid token
                    .send({ email: 'test@test.com' });

                expect(res).to.have.status(500);
                expect(res.body).to.have.property('error');
            });
        });
    });
});
