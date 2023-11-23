const { getUser } = require('../../controllers/userController');
const User = require('../../models/userModel');
const { createCustomError } = require('../../utils/customError');

jest.mock('../../models/userModel');

describe('getUser', () => {
    const req = {
        params: {
            id: '637991340633659227958f74', // Valid ObjectId
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

    it('should fetch a user by ID and return success response', async () => {
        const mockUser = { _id: '637991340633659227958f74', name: 'John Doe', email: 'johndoe@example.com' };
        User.findById.mockResolvedValue(mockUser); // Use findById instead of findOne

        await getUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            msg: 'User fetched successfully',
            success: true,
            data: mockUser,
        });
    });

    it('should handle invalid user ID', async () => {
        req.params.id = 'invalid_user_id'; // Invalid ObjectId

        await getUser(req, res, next);

        expect(next).toHaveBeenCalledWith(createCustomError('Invalid user ID: invalid_user_id', 400));
    });

    it('should handle user not found', async () => {
        req.params.id = '637991340633659227958f74'; // Valid ObjectId
        User.findById.mockResolvedValue(null);

        await getUser(req, res, next);

        expect(next).toHaveBeenCalledWith(createCustomError('No user with id: 637991340633659227958f74', 404));
    });
});
