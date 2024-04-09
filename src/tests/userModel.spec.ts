import { User, UserModel } from '../models/user';
import { pool } from '../dbConfig/db';
import bcrypt from 'bcrypt';

const userModel = new UserModel();

// Clears all user test data from the database to ensure a clean slate for tests.
export const clearUserTestData = async () => {
  await pool.query('DELETE FROM users');
};

// Creates a user in the database for testing purposes, simplifying test setup.
export const createUserForTest = async (): Promise<User> => {
  return userModel.create(
    'testusername',
    'testuser@testmail.com',
    'password123',
  );
};

describe('User Model', () => {
  // Setup: Clears user data before each test to ensure test isolation.
  beforeEach(async () => {
    await clearUserTestData();
  });

  // Teardown: Optionally clears user data after each test to clean up.
  afterEach(async () => {
    await clearUserTestData();
  });

  // Tests the `create` method's ability to add a new user to the database.
  describe('Create method', () => {
    it('should add a user', async () => {
      const result = await userModel.create(
        'testcreateuser',
        'testcreateuser@testuser.com',
        'password123',
      );
      // Verifies that the user creation result matches the expected structure and content.
      expect(result).toEqual(
        jasmine.objectContaining({
          id: jasmine.any(Number),
          username: 'testcreateuser',
          email: 'testcreateuser@testuser.com',
        }),
      );
    });
  });

  // Tests the `verifyPassword` method's accuracy in password comparison.
  describe('Verify Password method', () => {
    it('should return true for correct password', async () => {
      const newUser = await createUserForTest();
      const result = await userModel.verifyPassword(newUser.id, 'password123');
      // Asserts that the correct password returns true.
      expect(result).toBeTrue();
    });

    it('should return false for incorrect password', async () => {
      const newUser = await createUserForTest();
      const result = await userModel.verifyPassword(
        newUser.id,
        'wrongpassword',
      );
      // Asserts that an incorrect password returns false.
      expect(result).toBeFalse();
    });
  });

  // Tests the `index` method's ability to retrieve an array of all users.
  describe('index method', () => {
    it('should return an array of users', async () => {
      await createUserForTest(); // Ensure there's at least one user in the database.
      const users = await userModel.index();
      // Checks that the method returns an array.
      expect(users).toEqual(jasmine.any(Array));
    });
  });

  // Tests the `show` method's ability to retrieve a single user by ID.
  describe('show method', () => {
    it('should return the correct user by id', async () => {
      const newUser = await createUserForTest();
      const foundUser = await userModel.show(newUser.id);
      // Verifies that the retrieved user matches the created user's details.
      expect(foundUser.id).toBe(newUser.id);
      expect(foundUser.username).toBe('testusername');
      expect(foundUser.email).toBe('testuser@testmail.com');
    });
  });

  // Tests the `update` method's functionality for changing user details.
  describe('Update method', () => {
    it('should update user details', async () => {
      const newUser = await createUserForTest();
      const updatedUser = await userModel.update(
        newUser.id,
        'newusername',
        'newuser@testmail.com',
      );
      // Asserts that the user details were updated as expected.
      expect(updatedUser.username).toBe('newusername');
      expect(updatedUser.email).toBe('newuser@testmail.com');
    });

    it('should hash updated password', async () => {
      const newUser = await createUserForTest();
      await userModel.update(newUser.id, undefined, undefined, 'newpassword');

      // Fetches the updated user's hashed password from the database.
      const { rows } = await pool.query(
        'SELECT password FROM users WHERE id = $1',
        [newUser.id],
      );
      const hashedPassword = rows[0].password;

      // Validates that the new password is correctly hashed.
      const passwordMatch = await bcrypt.compare('newpassword', hashedPassword);
      expect(passwordMatch).toBeTrue(); // The password should be hashed and match the new password.
    });
  });

  // Tests the `delete` method's ability to remove a user from the database.
  describe('Delete method', () => {
    it('should delete the user', async () => {
      const newUser = await createUserForTest();
      const deletedUser = await userModel.delete(newUser.id);
      // Asserts that the deleted user's ID matches the expected ID.
      expect(deletedUser.id).toBe(newUser.id);

      // Attempts to fetch the deleted user, expecting an error due to non-existence.
      await expectAsync(userModel.show(newUser.id)).toBeRejectedWithError(); // Assumes `show` method throws an error if the user doesn't exist.
    });
  });
});
