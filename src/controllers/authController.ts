import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/user'; // Import your User model

const userModel = new UserModel();

export const login = async (req: Request, res: Response) => {
  try {
    const { id, password } = req.body;

    // Find the user by username
    const user = await userModel.show(id);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Verify the password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'No JWT Key Available' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, is_admin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
