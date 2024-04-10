import { Request, Response } from 'express';
import { UserModel } from '../models/user';

const userModel = new UserModel();

export const index = async (req: Request, res: Response) => {
  try {
    const users = await userModel.index();
    res.json(users);
  } catch (err) {
    res.status(500).json({ err });
  }
};

export const show = async (req: Request, res: Response) => {
  try {
    const user = await userModel.show(parseInt(req.params.id));
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ err });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { username, email, password, is_admin } = req.body;
    const newUser = await userModel.create(username, email, password, is_admin);
    res.json(newUser);
  } catch (err) {
    res.status(500).json({ err });
  }
};
