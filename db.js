import { Pool } from 'pg';
import dbConfig from './dbConfig.js';

export const pool = new Pool(dbConfig);
