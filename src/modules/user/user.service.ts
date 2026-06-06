import { pool } from "./../../db/db";
import type { IUSer } from "./user.interface";
import bcrypt from "bcryptjs";

const createUserIntoDB = async (payload: IUSer) => {
  const { name, email, password, role } = payload;
  const hashedPassword = await bcrypt.hash(password, 8);
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role)
   VALUES ($1, $2, $3, $4)
   RETURNING *
   `,
    [name, email, hashedPassword, role || "contributor"],
  );
  delete result.rows[0].password;
  return result;
};

const getAllUsersFromDB = async () => {
  const result = await pool.query(`SELECT * FROM users`);
  return result;
};

const getSingleUserFromDB = async (id: string) => {
  const result = await pool.query(`SELECT * FROM users WHERE id=$1`, [id]);
  return result;
};

const updateUserIntoDB = async (payload: IUSer, id: string) => {
  const { name, email, password, role } = payload;
  const hashedPassword = await bcrypt.hash(password, 8);
  const result = await pool.query(
    `UPDATE users 
      SET 
      name=COALESCE($1, name), 
      email=COALESCE($2, email), 
      password=COALESCE($3, password), 
      role=COALESCE($4, role) 
      WHERE id=$5 RETURNING *`,
    [name, email, hashedPassword, role, id],
  );
  delete result.rows[0].password;
  return result;
};

const deleteUserFromDB = async (id: string) => {
  const result = await pool.query(`DELETE FROM users WHERE id=$1`, [id]);
  return result;
};

export const userService = {
  createUserIntoDB,
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateUserIntoDB,
  deleteUserFromDB,
};
