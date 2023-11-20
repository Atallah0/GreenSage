const mongoose = require('mongoose');
const request = require('supertest');
const { createUser } = require('../../controllers/userController');
const User = require('../../models/userModel');
const process = require('process');
require('dotenv').config();


describe('createUser API', () => {
    // beforeAll(async () => {
    //     await mongoose.connect(process.env.MONGO_URI, {
    //         useNewUrlParser: true,
    //         useUnifiedTopology: true,
    //     });
    // });

    // afterAll(async () => {
    //     await mongoose.connection.close();
    // });

    // beforeEach(async () => {
    //     await User.deleteMany();
    // });
    it('should create a new user successfully', async () => {
        const response = await request(createUser)
            .post('/api/users')
            .send({ name: 'John Doe', email: 'johndoe@example.com' });

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            msg: 'User created successfully',
            success: true,
            data: {
                name: 'John Doe',
                email: 'johndoe@example.com',
                _id: expect.any(String),
            },
        });
    });

    it('should not create a user if name is missing', async () => {
        const response = await request(createUser)
            .post('/api/users')
            .send({ email: 'johndoe@example.com' });

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: {
                message: 'Please provide both name and email',
                statusCode: 400,
            },
        });
    });

    it('should not create a user if email is missing', async () => {
        const response = await request(createUser)
            .post('/api/users')
            .send({ name: 'John Doe' });

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: {
                message: 'Please provide both name and email',
                statusCode: 400,
            },
        });
    });

    it('should not create a user if email already exists', async () => {
        await User.create({ name: 'Jane Doe', email: 'janedoe@example.com' });

        const response = await request(createUser)
            .post('/api/users')
            .send({ name: 'John Doe', email: 'janedoe@example.com' });

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
            error: {
                message: 'Email already exists',
                statusCode: 400,
            },
        });
    });
});
