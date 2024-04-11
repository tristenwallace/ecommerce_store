import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user';

const userModel = new UserModel();

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    let user;
    try {
      // Attempt to find the user by username
      user = await userModel.getByUsername(username);
    } catch (error: unknown) {
      // Check if the error is an instance of Error and contains the expected message
      if (
        error instanceof Error &&
        error.message.includes('User not found with username')
      ) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      // If it's another error, throw it to be caught by the outer catch block
      throw error;
    }

    // Action: Verify the password for the created user
    const isValid = await userModel.verifyPassword(user.id, password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check for JWT_SECRET environment variable
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'No JWT Key Available' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, is_admin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );

    res.json({ token });
  } catch (error) {
    console.error('Error in login function:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
