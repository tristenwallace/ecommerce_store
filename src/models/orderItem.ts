import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_NAME,
});

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
}

export class OrderItemModel {
  async getAll(): Promise<OrderItem[]> {
    const { rows } = await pool.query('SELECT * FROM order_items');
    return rows;
  }

  async getById(id: number): Promise<OrderItem> {
    const { rows } = await pool.query(
      'SELECT * FROM order_items WHERE id = $1',
      [id],
    );
    return rows[0];
  }

  async create(
    order_id: number,
    product_id: number,
    quantity: number,
  ): Promise<OrderItem> {
    const { rows } = await pool.query(
      'INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [order_id, product_id, quantity],
    );
    return rows[0];
  }

  async delete(id: number): Promise<OrderItem> {
    const { rows } = await pool.query(
      'DELETE FROM order_items WHERE id = $1 RETURNING *',
      [id],
    );
    return rows[0];
  }

  async update(
    id: number,
    order_id: number,
    product_id: number,
    quantity: number,
  ): Promise<OrderItem> {
    const { rows } = await pool.query(
      'UPDATE order_items SET order_id = $2, product_id = $3, quantity = $4 WHERE id = $1 RETURNING *',
      [id, order_id, product_id, quantity],
    );
    return rows[0];
  }
}
