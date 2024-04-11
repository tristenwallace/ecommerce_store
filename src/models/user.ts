import { pool } from '../dbConfig/db';
import bcrypt from 'bcrypt';

// Interface representing the structure of a user in the database
export interface User {
  id: number;
  username: string;
  email: string;
  password: string; // This is the hashed password
  is_admin: boolean;
}

export class UserModel {
  /**
   * Creates a new user in the database.
   * @param username The username of the new user.
   * @param email The email address of the new user.
   * @param password The plaintext password to be hashed and stored.
   * @param is_admin Specifies if the new user should have admin rights.
   * @param currentUserId The ID of the current user performing this operation, needed for admin creation.
   * @returns The created user object excluding the password for security.
   */
  async create(
    username: string,
    email: string,
    password: string,
    is_admin: boolean = false,
    currentUserId?: number,
  ): Promise<User> {
    try {
      // Ensures required fields are provided
      if (!username || !email || !password) {
        throw new Error('Missing required fields');
      }

      // Admin creation logic
      if (is_admin) {
        if (!currentUserId) {
          throw new Error(
            'Unauthorized: A valid admin user ID is required to create another admin user.',
          );
        }

        const currentUser = await this.show(currentUserId);

        if (!currentUser || !currentUser.is_admin) {
          throw new Error(
            'Unauthorized: Only admins can create other admin users.',
          );
        }
      }

      // Password hashing
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // User insertion into the database
      const { rows } = await pool.query(
        'INSERT INTO users (username, email, password, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, username, email, is_admin',
        [username, email, hashedPassword, is_admin],
      );
      return rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Verifies if the provided password matches the stored hashed password for a user.
   * @param userId The ID of the user whose password needs to be verified.
   * @param password The plaintext password to verify.
   * @returns True if the password matches, false otherwise.
   */
  async verifyPassword(userId: number, password: string): Promise<boolean> {
    try {
      const { rows } = await pool.query(
        'SELECT password FROM users WHERE id = $1',
        [userId],
      );

      if (rows.length) {
        const user = rows[0];
        return await bcrypt.compare(password, user.password);
      }

      throw new Error('User not found');
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }

  /**
   * Retrieves all users from the database.
   * @returns An array of user objects.
   */
  async index(): Promise<User[]> {
    try {
      const { rows } = await pool.query(
        'SELECT id, username, email, is_admin FROM users',
      );
      return rows;
    } catch (error) {
      console.error('Error retrieving all users:', error);
      throw error;
    }
  }

  /**
   * Retrieves a single user by their ID.
   * @param id The ID of the user to retrieve.
   * @returns The requested user object or an error if not found.
   */
  async show(id: number): Promise<User> {
    try {
      const { rows } = await pool.query(
        'SELECT id, username, email, is_admin FROM users WHERE id = $1',
        [id],
      );
      if (rows.length === 0) {
        throw new Error(`User not found with ID: ${id}`);
      }
      return rows[0];
    } catch (error) {
      // Suppress log messages if running in test environment
      if (process.env.NODE_ENV !== 'test') {
        console.error(`Error retrieving user with ID ${id}:`, error);
      }
      throw error;
    }
  }

  /**
   * Retrieves a single user by their ID.
   * @param id The ID of the user to retrieve.
   * @returns The requested user object or an error if not found.
   */
  async getByUsername(username: string): Promise<User> {
    try {
      const { rows } = await pool.query(
        'SELECT id, username, email, is_admin FROM users WHERE username = $1',
        [username],
      );
      if (rows.length === 0) {
        throw new Error(`User not found with username: ${username}`);
      }
      return rows[0];
    } catch (error) {
      // Suppress log messages if running in test environment
      if (process.env.NODE_ENV !== 'test') {
        console.error(
          `Error retrieving user with username ${username}:`,
          error,
        );
      }
      throw error;
    }
  }

  /**
   * Deletes a user from the database by their ID.
   * @param id The ID of the user to delete.
   * @returns The deleted user object or an error if not found.
   */
  async delete(id: number): Promise<User> {
    try {
      const { rows } = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id, username, email, is_admin',
        [id],
      );
      if (rows.length === 0) {
        throw new Error(`User not found with ID: ${id}`);
      }
      return rows[0];
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Updates the details of an existing user in the database.
   * @param id The ID of the user to update.
   * @param username The new username of the user (optional).
   * @param email The new email of the user (optional).
   * @param password The new plaintext password of the user to be hashed (optional).
   * @param is_admin Specifies if the user should have admin rights (optional).
   * @param currentUserId The ID of the current user performing this operation, needed for admin status changes.
   * @returns The updated user object or an error if not found.
   */
  async update(
    id: number,
    username?: string,
    email?: string,
    password?: string,
    is_admin?: boolean,
    currentUserId?: number,
  ): Promise<User> {
    try {
      let query = 'UPDATE users SET ';
      const values = [];
      let count = 1;

      // Conditional query construction based on provided values
      if (username) {
        query += `username = $${count}, `;
        values.push(username);
        count++;
      }

      if (email) {
        query += `email = $${count}, `;
        values.push(email);
        count++;
      }

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        query += `password = $${count}, `;
        values.push(hashedPassword);
        count++;
      }

      // Admin status update logic
      if (is_admin) {
        if (!currentUserId) {
          throw new Error(
            'Unauthorized: A valid admin user ID is required to update admin status.',
          );
        }

        const currentUser = await this.show(currentUserId);

        if (!currentUser || !currentUser.is_admin) {
          throw new Error('Unauthorized: Only admins can change admin status.');
        }

        query += `is_admin = $${count}, `;
        values.push(is_admin);
        count++;
      }

      // Finalizing the query and executing
      query = query.slice(0, -2); // Remove the trailing comma and space
      query += ` WHERE id = $${count} RETURNING id, username, email, is_admin`;

      values.push(id);

      const { rows } = await pool.query(query, values);
      if (rows.length === 0) {
        throw new Error(`User not found with ID: ${id}`);
      }
      return rows[0];
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      throw error;
    }
  }
}
