import { User, UserModel } from '../models/user';
import { pool } from '../dbConfig/db';
import bcrypt from 'bcrypt';

const userModel = new UserModel();

const clearUserTestData = async () => {
  await pool.query('DELETE FROM users');
};

// Helper function to create a user for testing
const createUserForTest = async (): Promise<User> => {
  return userModel.create(
    'testusername',
    'testuser@testmail.com',
    'password123',
  );
};

describe('User Model', () => {
  beforeEach(async () => {
    await clearUserTestData();
  });

  afterEach(async () => {
    await clearUserTestData();
  });

  describe('Create method', () => {
    it('should add a user', async () => {
      const result = await userModel.create(
        'testcreateuser',
        'testcreateuser@testuser.com',
        'password123',
      );
      expect(result).toEqual(
        jasmine.objectContaining({
          id: jasmine.any(Number),
          username: 'testcreateuser',
          email: 'testcreateuser@testuser.com',
        }),
      );
    });
  });

  describe('Verify Password method', () => {
    it('should return true for correct password', async () => {
      const newUser = await createUserForTest();
      const result = await userModel.verifyPassword(newUser.id, 'password123');
      expect(result).toBeTrue();
    });

    it('should return false for incorrect password', async () => {
      const newUser = await createUserForTest();
      const result = await userModel.verifyPassword(
        newUser.id,
        'wrongpassword',
      );
      expect(result).toBeFalse();
    });
  });

  describe('index method', () => {
    it('should return an array of users', async () => {
      await createUserForTest(); // Ensure at least one user exists
      const users = await userModel.index();
      expect(users).toEqual(jasmine.any(Array));
    });
  });

  describe('show method', () => {
    it('should return the correct user by id', async () => {
      const newUser = await createUserForTest();
      const foundUser = await userModel.show(newUser.id);
      expect(foundUser.id).toBe(newUser.id);
      expect(foundUser.username).toBe('testusername');
      expect(foundUser.email).toBe('testuser@testmail.com');
    });
  });

  describe('Update method', () => {
    it('should update user details', async () => {
      const newUser = await createUserForTest();
      const updatedUser = await userModel.update(
        newUser.id,
        'newusername',
        'newuser@testmail.com',
      );
      expect(updatedUser.username).toBe('newusername');
      expect(updatedUser.email).toBe('newuser@testmail.com');
    });

    it('should hash updated password', async () => {
      const newUser = await createUserForTest();
      await userModel.update(newUser.id, undefined, undefined, 'newpassword');

      // Directly query the database to get the hashed password
      const { rows } = await pool.query(
        'SELECT password FROM users WHERE id = $1',
        [newUser.id],
      );
      const hashedPassword = rows[0].password;

      // Compare the plaintext password with the hashed password
      const passwordMatch = await bcrypt.compare('newpassword', hashedPassword);
      expect(passwordMatch).toBeTrue(); // The password should be correctly hashed
    });
  });

  describe('Delete method', () => {
    it('should delete the user', async () => {
      const newUser = await createUserForTest();
      const deletedUser = await userModel.delete(newUser.id);
      expect(deletedUser.id).toBe(newUser.id);

      // Attempt to fetch the deleted user to confirm deletion
      await expectAsync(userModel.show(newUser.id)).toBeRejectedWithError();
    });
  });
});
