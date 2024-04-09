import { pool } from '../dbConfig/db';

export interface Order {
  id: number;
  user_id: number;
  status: string;
}

export class OrderModel {
  async index(): Promise<Order[]> {
    const { rows } = await pool.query('SELECT * FROM orders');
    return rows;
  }

  async show(id: number): Promise<Order> {
    const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [
      id,
    ]);
    return rows[0];
  }

  async create(user_id: number, status: string): Promise<Order> {
    const { rows } = await pool.query(
      'INSERT INTO orders (user_id, status) VALUES ($1, $2) RETURNING *',
      [user_id, status],
    );
    return rows[0];
  }

  async delete(id: number): Promise<Order> {
    const { rows } = await pool.query(
      'DELETE FROM orders WHERE id = $1 RETURNING *',
      [id],
    );
    return rows[0];
  }

  async update(id: number, user_id: number, status: string): Promise<Order> {
    const { rows } = await pool.query(
      'UPDATE orders SET user_id = $2, status = $3 WHERE id = $1 RETURNING *',
      [id, user_id, status],
    );
    return rows[0];
  }
}
