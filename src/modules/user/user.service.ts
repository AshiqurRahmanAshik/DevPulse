import { pool } from "./../../db/db";
import type { IUSer } from "./user.interface";

const createUserIntoDB = async (payload: IUSer) => {
  const { name, email, password, role } = payload;
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role)
   VALUES ($1, $2, $3, $4)
   RETURNING *
   `,
    [name, email, password, role || "contributor"],
  );
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
