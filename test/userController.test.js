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

describe('User Controller', () => {
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
        describe('loginUser', () => {
            it('should return 400 if email or password is missing', (done) => {
                chai
                    .request(app)
                    .post('/api/users/login')
                    .send({})
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property('error', 'Please provide both email and password.');
                        done();
                    });
            });

            it('should return 200 and token on successful login', async () => {
                axiosMock.onPost(`${process.env.BASE_URL}/login_user`).reply(200, {
                    result: {
                        user_data: { email: 'test@test.com', name: 'Test User' },
                    },
                });

                const res = await chai
                    .request(app)
                    .post('/api/users/login')
                    .send({ email: 'test@test.com', password: 'validpassword' });

                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'Login successful!');
                expect(res.body).to.have.property('token', mockToken);
            });
        });

        describe('registerUser', () => {
            it('should return 400 if required fields are missing', (done) => {
                chai
                    .request(app)
                    .post('/api/users/register')
                    .send({ email: 'test@test.com', password: 'password123' })
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property('error', 'Name, email, and password are required.');
                        done();
                    });
            });

            it('should return 201 on successful registration', async () => {
                axiosMock.onPost(`${process.env.BASE_URL}/register_user`).reply(201, {
                    message: 'Registration successful',
                });

                const res = await chai
                    .request(app)
                    .post('/api/users/register')
                    .send({
                        name: 'Test User',
                        email: 'test@test.com',
                        password: 'password123',
                    });

                expect(res).to.have.status(201);
                expect(res.body).to.have.property('message', 'Registration successful');
            });
        });
    });

    describe('Protected Routes', () => {
        describe('updateUser', () => {
            it('should return 400 if email is missing', (done) => {
                chai
                    .request(app)
                    .post('/api/users/update')
                    .set('Authorization', `Bearer ${mockToken}`) // Include valid token
                    .send({ name: 'Updated User' }) // Missing email
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property('error', 'Email is required to identify the user.');

                        done();
                    });
            });

            it('should return 200 on successful user update', async () => {
                axiosMock.onPost(`${process.env.BASE_URL}/update_user`).reply(200, {
                    result: {
                      message: 'User updated successfully!',

                        updated_fields: ['name', 'email'],
                    },
                });

                const res = await chai
                    .request(app)
                    .post('/api/users/update')
                    .set('Authorization', `Bearer ${mockToken}`) // Include valid token
                    .send({ email: 'test@test.com', name: 'Updated User' });

                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message', 'User updated successfully!');
                expect(res.body.updatedFields).to.include('name');
            });
        });

        describe('getUser', () => {
            it('should return 400 if email is missing', (done) => {
                chai
                    .request(app)
                    .post('/api/users/getUser')
                    .set('Authorization', `Bearer ${mockToken}`) // Include valid token
                    .send({}) // Missing email
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property('error', 'Email is required to identify the user.');
                        done();
                    });
            });

            it('should return user data on success', async () => {
                axiosMock.onPost(`${process.env.BASE_URL}/get_user`).reply(200, {
                    result: {
                        user_data: { email: 'test@test.com', name: 'Test User' },
                    },
                });

                const res = await chai
                    .request(app)
                    .post('/api/users/getUser')
                    .set('Authorization', `Bearer ${mockToken}`) // Include valid token
                    .send({ email: 'test@test.com' });

                expect(res).to.have.status(200);
                expect(res.body.user).to.include({ email: 'test@test.com', name: 'Test User' });
            });
        });
        describe('Error 500', () => {
          it('should return 500 if the server encounters an error', async () => {
            axiosMock.onPost(`${process.env.BASE_URL}/register_user`).reply(500, {
                error: 'Internal Server Error'
            });
    
            const res = await chai
                .request(app)
                .post('/api/users/register')
                .send({ name: "hhhh" ,email: 'test@test.com', password: 'password123' });
    
            expect(res).to.have.status(500);
            expect(res.body).to.have.property('error');
        });
      });
    });
});
