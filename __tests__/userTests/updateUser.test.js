const { updateUser } = require('../../controllers/userController');
const User = require('../../models/userModel');
const { createCustomError } = require('../../utils/customError');

jest.mock('../../models/userModel');

describe('updateUser', () => {
    const req = {
        params: {
            id: '637991340633659227958f74', // Valid ObjectId
        },
        body: {
            name: 'Updated Name',
            email: 'updated_email@example.com',
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

    it('should update a user and return success response', async () => {
        const mockExistingUser = {
            _id: '637991340633659227958f74',
            name: 'John Doe',
            email: 'johndoe@example.com',
        };

        const mockUpdatedUser = {
            _id: '637991340633659227958f74',
            name: 'Updated Name',
            email: 'updated_email@example.com',
        };

        User.findById.mockResolvedValue(mockExistingUser);
        User.findOneAndUpdate.mockResolvedValue(mockUpdatedUser);

        await updateUser(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            msg: 'User updated successfully',
            success: true,
            data: mockUpdatedUser,
        });
    });

    it('should handle invalid user ID', async () => {
        req.params.id = 'invalid_user_id'; // Invalid ObjectId

        await updateUser(req, res, next);

        expect(next).toHaveBeenCalledWith(createCustomError('Invalid user ID: invalid_user_id', 400));
    });

    it('should handle no changes to update', async () => {
        const mockExistingUser = {
            _id: '637991340633659227958f74',
            name: 'John Doe',
            email: 'johndoe@example.com',
        };
    
        req.params.id = '637991340633659227958f74'; // Valid ObjectId
        req.body = {
            name: 'John Doe',
            email: 'johndoe@example.com',
        };
    
        User.findById.mockResolvedValue(mockExistingUser);
    
        await updateUser(req, res, next);
    
        expect(next).toHaveBeenCalledWith(createCustomError('Nothing to update', 400));
    });    
});
