import { Pool } from 'pg';
import dbConfig from './dbConfig';

export const pool = new Pool(dbConfig);
