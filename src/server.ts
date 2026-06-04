import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { Pool } from "pg";
import config from "./config/config";

const app: Application = express();
const port = config.port;

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  connectionString: config.connection_string,
});

const initDB = async () => {
  try {
    await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'contributor'
      CHECK (role IN ('contributor', 'maintainer')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
`);
  } catch (error) {
    console.log(error);
  }
};
initDB();

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Express Server", author: "Next Level" });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
