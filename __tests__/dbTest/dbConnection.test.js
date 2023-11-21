const mongoose = require('mongoose');
const connectDB = require('../../db/dbConnection');

jest.mock('mongoose');

describe('dbConnection', () => {
  it('should connect to MongoDB successfully', async () => {
    // Mock the mongoose.connect method to return a promise that resolves to true
    mongoose.connect.mockResolvedValue(true);

    // Call the connectDB function with the MONGO_URI from the .env file
    await connectDB(process.env.MONGO_URI);

    // Expect the mongoose.connect method to have been called with the correct arguments
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);
  });

  it('should handle connection errors', async () => {
    // Mock the mongoose.connect method to reject with an error
    mongoose.connect.mockRejectedValue(new Error('Connection failed'));

    try {
      // Call the connectDB function with the MONGO_URI from the .env file
      await connectDB(process.env.MONGO_URI);
    } catch (error) {
      // Expect the error to have been caught and logged to the console
      expect(error.message).toBe('Connection failed');
    }
  });

//   afterAll(async () => {
//     // Close the connection to the MongoDB database
//     await mongoose.disconnect();
//   });
});
