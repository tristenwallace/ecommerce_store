import { Request, Response } from 'express';
import { UserModel } from '../models/user';

const userModel = new UserModel();

export const index = async (req: Request, res: Response) => {
  try {
    const users = await userModel.index();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Implement other handlers like 'show', 'create', etc.
