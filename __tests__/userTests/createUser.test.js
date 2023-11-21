// userController.test.js
const { createUser } = require('../../controllers/userController');
const User = require('../../models/userModel');
const { createCustomError } = require('../../utils/customError');

jest.mock('../../models/userModel'); // Mock the User model

describe('createUser', () => {
    const req = {
        body: {
            name: 'John Doe',
            email: 'john.doe@example.com',
        },
    };

    const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
    };

    const next = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a user and return success response', async () => {
        User.findOne.mockResolvedValue(null); // Mock that no user with the same email exists
        User.create.mockResolvedValue({
            name: 'John Doe',
            email: 'john.doe@example.com',
        });

        await createUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            msg: 'User created successfully',
            success: true,
            data: {
                name: 'John Doe',
                email: 'john.doe@example.com',
            },
        });
    });

    it('should handle error if user with the same email exists', async () => {
        User.findOne.mockResolvedValue({
            name: 'Existing User',
            email: 'john.doe@example.com',
        });

        await createUser(req, res, next);

        expect(next).toHaveBeenCalledWith(
            createCustomError('Email already exists', 400)
        );
    });

    it('should handle error if name or email is missing', async () => {
        const invalidReq = {
            body: {},
        };

        await createUser(invalidReq, res, next);

        expect(next).toHaveBeenCalledWith(
            createCustomError('Please provide both name and email', 400)
        );
    });

    // it('should handle unexpected errors', async () => {
    //     User.findOne.mockRejectedValue(new Error('Some unexpected error'));

    //     await createUser(req, res, next);

    //     expect(next).toHaveBeenCalledWith(new Error('Some unexpected error'));
    // });

    it('should handle unexpected errors', async () => {
        User.findOne.mockRejectedValue(createCustomError('Some unexpected error'));

        await createUser(req, res, next);

        expect(next).toHaveBeenCalledWith(createCustomError('Some unexpected error'));
    });
});
