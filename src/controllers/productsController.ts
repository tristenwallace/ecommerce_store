import { Request, Response } from 'express';
import { ProductModel } from '../models/product';

const productModel = new ProductModel();

export const index = async (req: Request, res: Response) => {
  try {
    const products = await productModel.index();
    res.json(products);
  } catch (err) {
    res.status(500).json({ err });
  }
};

export const show = async (req: Request, res: Response) => {
  try {
    const product = await productModel.show(parseInt(req.params.id));
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ err });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { name, price, category } = req.body;
    const newProduct = await productModel.create(name, price, category);
    res.json(newProduct);
  } catch (err) {
    res.status(500).json({ err });
  }
};
