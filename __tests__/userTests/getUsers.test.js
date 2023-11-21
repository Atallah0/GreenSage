// userController.test.js
const { getUsers } = require('../../controllers/userController');
const User = require('../../models/userModel');
const { createCustomError } = require('../../utils/customError');

jest.mock('../../models/userModel');


describe('getUsers', () => {
    const req = {};
    const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
    };
    const next = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch users and return success response', async () => {
        const mockUsers = [
            { name: 'User1', email: 'user1@example.com' },
            { name: 'User2', email: 'user2@example.com' },
        ];

        User.find.mockResolvedValue(mockUsers);

        await getUsers(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            msg: 'Users fetched successfully',
            success: true,
            data: mockUsers,
        });
    });

    it('should handle unexpected errors', async () => {
        User.find.mockRejectedValue(createCustomError('Some unexpected error'));

        await getUsers(req, res, next);

        expect(next).toHaveBeenCalledWith(createCustomError('Some unexpected error'));
    });
});
