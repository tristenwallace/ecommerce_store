import { Request, Response } from 'express';
import { ProductModel } from '../models/product';

const productModel = new ProductModel();

export const index = async (req: Request, res: Response) => {
  try {
    const products = await productModel.index();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Implement other handlers like 'show', 'create', etc.
