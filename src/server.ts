import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { Pool } from "pg";

const app: Application = express();
const port = 3000;

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));





app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Express Server", author: "Next Level" });
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
