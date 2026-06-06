import type { IUSer } from "../user/user.interface";
import type { IuserLogin, IuserRegistration } from "./auth.interface";
import { pool } from "./../../db/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../config/config";

const signupUserIntoDB = async (payload: IuserRegistration) => {
  const { name, email, password, role } = payload;
  const hashedPassword = await bcrypt.hash(password, 10);

  if (!name || !email || !password) {
    throw new Error("All fields are required");
  }
  const userAlreadyExits = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email],
  );

  if (userAlreadyExits.rows.length > 0) {
    throw new Error("User already exists");
  }
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashedPassword, role || "contributor"],
  );

  return result.rows[0];
};

const loginUserIntoDB = async (payload: IuserLogin) => {
  const { email, password } = payload;

  if (!email || !password) {
    throw new Error("Email and password required");
  }

  // find user
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  const user = result.rows[0];

  if (!user) {
    throw new Error("User not found");
  }

  // check password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // create token
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
  };
  const token = jwt.sign(jwtPayload, config.jwt_secret as string, {
    expiresIn: "1d",
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  };
};

export const authService = {
  signupUserIntoDB,
  loginUserIntoDB,
};
