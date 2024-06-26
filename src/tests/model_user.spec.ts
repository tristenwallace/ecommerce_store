import { User, UserModel } from '../models/user';
import { pool } from '../dbConfig/db';
import bcrypt from 'bcrypt';

// UserModel instance for interacting with the database in tests
const userModel = new UserModel();

/**
 * Clears all user test data from the database.
 * Ensures a clean state for each test run.
 */
export const clearUserTestData = async () => {
  await pool.query('DELETE FROM users');
};

/**
 * Creates a user in the database for testing.
 * Simplifies the setup process for tests that require an existing user.
 * @returns A promise that resolves to the created User object.
 */
export const createUserForTest = async (): Promise<User> => {
  return userModel.create(
    'testusername',
    'testuser@testmail.com',
    'password123',
    false,
  );
};

describe('User Model', () => {
  beforeEach(async () => {
    // Clears user data before each test for a clean testing environment
    await clearUserTestData();
  });

  afterEach(async () => {
    // Optionally clears user data after each test to prevent data pollution
    await clearUserTestData();
  });

  describe('Create method', () => {
    it('should add a user', async () => {
      // Test case for creating a user with specific details
      const result = await userModel.create(
        'testcreateuser',
        'testcreateuser@testuser.com',
        'password123',
        false, // Indicates that this is not an admin user
      );

      // Expectation: The result should match the specified user details
      expect(result).toEqual(
        jasmine.objectContaining({
          id: jasmine.any(Number), // User ID can be any number
          username: 'testcreateuser',
          email: 'testcreateuser@testuser.com',
          is_admin: false, // Verifying that the user is not an admin
        }),
      );
    });
  });

  describe('Verify Password method', () => {
    it('should return true for correct password', async () => {
      // Setup: Create a user for testing the password verification
      const newUser = await createUserForTest();

      // Action: Verify the password for the created user
      const result = await userModel.verifyPassword(newUser.id, 'password123');

      // Expectation: The password should be verified successfully
      expect(result).toBeTrue();
    });

    it('should return false for incorrect password', async () => {
      // Setup: Create a user for testing incorrect password verification
      const newUser = await createUserForTest();

      // Action: Attempt to verify an incorrect password for the created user
      const result = await userModel.verifyPassword(
        newUser.id,
        'wrongpassword',
      );

      // Expectation: The incorrect password should not be verified
      expect(result).toBeFalse();
    });
  });

  describe('Index method', () => {
    it('should return an array of users', async () => {
      // Setup: Ensure there is at least one user in the database
      await createUserForTest();

      // Action: Retrieve all users from the database
      const users = await userModel.index();

      // Expectation: The result should be an array of users
      expect(users).toEqual(jasmine.any(Array));
    });
  });

  describe('Show method', () => {
    it('should return the correct user by id', async () => {
      // Setup: Create a user for testing retrieval by ID
      const newUser = await createUserForTest();

      // Action: Retrieve the created user by their ID
      const foundUser = await userModel.show(newUser.id);

      // Expectation: The retrieved user should match the created user's details
      expect(foundUser).toEqual(
        jasmine.objectContaining({
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          is_admin: newUser.is_admin, // Verify the admin status of the retrieved user
        }),
      );
    });
  });

  describe('getByUsername', () => {
    it('should return the user with the given username', async () => {
      // Setup: Create a user for testing retrieval by username
      const newUser = await createUserForTest();

      // Action: Retrieve the created user by their username
      const foundUser = await userModel.getByUsername(newUser.username);

      expect(foundUser).not.toBeUndefined();
      expect(foundUser?.username).toBe('testusername');
      // Add more assertions as needed to verify the returned user object
    });

    it('should throw an error for non-existing username', async () => {
      try {
        await userModel.getByUsername('nonexistinguser');
        fail('Expected getByUsername to throw for non-existing username');
      } catch (error) {
        const errorMessage = (error as Error).message;
        expect(errorMessage).toContain(
          'User not found with username: nonexistinguser',
        );
      }
    });
  });

  describe('Update method', () => {
    it('should update user details', async () => {
      try {
        const newUser = await createUserForTest();
        const updatedUser = await userModel.update(
          newUser.id,
          'newusername',
          'newuser@testmail.com',
          'newpassword123',
          false,
          newUser.id,
        );

        expect(updatedUser).toEqual(
          jasmine.objectContaining({
            username: 'newusername',
            email: 'newuser@testmail.com',
            is_admin: false,
          }),
        );
      } catch (error) {
        fail(`Unexpected error occurred: ${error}`);
      }
    });

    it('should hash updated password', async () => {
      try {
        const newUser = await createUserForTest();
        await userModel.update(
          newUser.id,
          undefined,
          undefined,
          'newpassword',
          undefined,
          newUser.id,
        );
        const { rows } = await pool.query(
          'SELECT password FROM users WHERE id = $1',
          [newUser.id],
        );
        const hashedPassword = rows[0].password;
        const passwordMatch = await bcrypt.compare(
          'newpassword',
          hashedPassword,
        );

        expect(passwordMatch).toBeTrue();
      } catch (error) {
        fail(`Unexpected error occurred: ${error}`);
      }
    });
  });

  describe('Delete method', () => {
    it('should delete the user', async () => {
      // Setup: Create a user for testing deletion
      const newUser = await createUserForTest();

      // Action: Delete the created user
      const deletedUser = await userModel.delete(newUser.id);

      // Expectation: The deleted user's ID should match the created user's ID
      expect(deletedUser.id).toBe(newUser.id);

      // Additional verification: Attempt to fetch the deleted user, expecting a failure
      await expectAsync(userModel.show(newUser.id)).toBeRejectedWithError();
    });
  });
});
