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

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Express Server", author: "Next Level" });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
