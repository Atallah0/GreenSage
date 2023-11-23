const { deleteUser } = require('../../controllers/userController');
const User = require('../../models/userModel');
const { createCustomError } = require('../../utils/customError');

jest.mock('../../models/userModel');

describe('deleteUser', () => {
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

    // it('should delete a user and return success response', async () => {
    //     const mockUserToDelete = {
    //         _id: '637991340633659227958f74',
    //         name: 'John Doe',
    //         email: 'johndoe@example.com',
    //     };

    //     User.findById.mockResolvedValue(mockUserToDelete);
    //     await User.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });

    //     const result = await deleteUser(req, res, next);

    //     expect(res.status).toHaveBeenCalledWith(200);
    //     expect(res.json).toHaveBeenCalledWith({
    //         msg: 'user deleted successfully',
    //         success: true,
    //     });
    // });


    it('should handle invalid user ID', async () => {
        req.params.id = 'invalid_user_id'; // Invalid ObjectId

        await deleteUser(req, res, next);

        expect(next).toHaveBeenCalledWith(createCustomError('Invalid user ID: invalid_user_id', 400));
    });

    it('should handle user not found', async () => {
        req.params.id = '637991340633659227958f74'; // Valid ObjectId
        User.findById.mockResolvedValue(null);

        await deleteUser(req, res, next);

        expect(next).toHaveBeenCalledWith(createCustomError('No user with id: 637991340633659227958f74', 404));
    });
});
