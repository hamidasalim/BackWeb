require('dotenv').config();

const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const axiosMockAdapter = require('axios-mock-adapter');
const app = require('../server.js'); // Adjust the path to your app.js file

const { expect } = chai;
chai.use(chaiHttp);

describe('vehicule Controller', () => {
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

    describe('Public Routes', () => {
        describe('getAvailableVehicles', () => {
            it('should return 400 if one date is missing', (done) => {
                chai
                    .request(app)
                    .post('/api/vehicles/available')
                    .send({})
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property('error', 'Please provide both start_date and end_date in YYYY-MM-DD format.');
                        done();
                    });
            });

            it('should return 200 and the list of the vehicules', async () => {
                axiosMock.onPost(`${process.env.BASE_URL}/available_cars`).reply(200, {
                    result: {
                        "available_cars": [
                            {
                                "id": 1,
                                "name": "Audi/A1/10001",
                                "license_plate": "10001",
                                "model": "A1",
                                "tarif": 150.0,
                                "picture":"/9651..6161"
                    }],
                    "status": "200"

                }
            });

                const res = await chai
                    .request(app)
                    .post('/api/vehicles/available')
                    .send({ start_date: '2024-01-01', end_date: '2024-01-07' });

                expect(res).to.have.status(200);
                expect(res.body.result).to.have.property('status', '200');
            });
            it('should return 500 if the server encounters an error', async () => {
                axiosMock.onPost(`${process.env.BASE_URL}/available_cars`).reply(500, {
                    error: 'Internal Server Error'
                });
        
                const res = await chai
                    .request(app)
                    .post('/api/vehicles/available')
                    .send({ start_date: '2024-01-01', end_date: '2024-01-07' });
        
                expect(res).to.have.status(500);
                expect(res.body).to.have.property('error');
            });
        });

        
      
    });
});
