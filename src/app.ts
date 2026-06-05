import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { pool } from "./db/db";
import { userRoute } from "./modules/user/user.route";

const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoute);

export default app;
