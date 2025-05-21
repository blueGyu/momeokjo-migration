import { Pool } from "pg";
import env from "../config/env";

const pool = new Pool({
  host: env.DB_HOST,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  port: parseInt(env.DB_PORT),
});

export default pool;
