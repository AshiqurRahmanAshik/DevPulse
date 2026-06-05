import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { initDB, pool } from "./db/db";

const app: Application = express();


app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));


app.post("/api/users", async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
   VALUES ($1, $2, $3, $4)
   RETURNING *
   `,
      [name, email, password, role || "contributor"],
    );
    const users = result.rows[0];
    res.status(201).json({
      success: true,
      message: "User Created Successfully",
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
      error: error,
    });
  }
});

app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM users`);
    res.status(200).json({
      success: true,
      message: "User Retrived Successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
      error: error,
    });
  }
});

app.get("/api/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM users WHERE id=$1`, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
        data: {},
      });
    }
    res.status(200).json({
      success: true,
      message: "User Retrived Successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
});

app.put("/api/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users 
      SET 
      name=COALESCE($1, name), 
      email=COALESCE($2, email), 
      password=COALESCE($3, password), 
      role=COALESCE($4, role) 
      WHERE id=$5 RETURNING *`,
      [name, email, password, role, id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
        data: {},
      });
    }
    res.status(200).json({
      success: true,
      message: "User Updated Successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
});

app.delete("/api/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM users WHERE id=$1`, [id]);
    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
        data: {},
      });
    }
    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
      data: {},
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
});

export default app;
