import { pool } from '../dbConfig/db';
import bcrypt from 'bcrypt';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  password: string; // This is the hashed password
}

export class UserModel {
  async create(
    first_name: string,
    last_name: string,
    password: string,
  ): Promise<User> {
    try {
      // Data validation (basic example)
      if (!first_name || !last_name || !password) {
        throw new Error('Missing required fields');
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const { rows } = await pool.query(
        'INSERT INTO users (first_name, last_name, password) VALUES ($1, $2, $3) RETURNING id, first_name, last_name',
        [first_name, last_name, hashedPassword],
      );
      return rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error; // Rethrow after logging (or handle as needed)
    }
  }

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

  async getAll(): Promise<User[]> {
    try {
      const { rows } = await pool.query(
        'SELECT id, first_name, last_name FROM users',
      );
      return rows;
    } catch (error) {
      console.error('Error retrieving all users:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<User> {
    try {
      const { rows } = await pool.query(
        'SELECT id, first_name, last_name FROM users WHERE id = $1',
        [id],
      );
      if (rows.length === 0) {
        throw new Error(`User not found with ID: ${id}`);
      }
      return rows[0];
    } catch (error) {
      console.error(`Error retrieving user with ID ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<User> {
    try {
      const { rows } = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id, first_name, last_name',
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

  async update(
    id: number,
    first_name?: string,
    last_name?: string,
    password?: string,
  ): Promise<User> {
    try {
      let query = 'UPDATE users SET ';
      const values = [];
      let count = 1;

      if (first_name) {
        query += `first_name = $${count}, `;
        values.push(first_name);
        count++;
      }

      if (last_name) {
        query += `last_name = $${count}, `;
        values.push(last_name);
        count++;
      }

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        query += `password = $${count}, `;
        values.push(hashedPassword);
        count++;
      }

      // Remove the trailing comma and space
      query = query.slice(0, -2);
      query += ` WHERE id = $${count} RETURNING id, first_name, last_name`;

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
