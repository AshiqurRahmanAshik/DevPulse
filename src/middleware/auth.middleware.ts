import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/config";
import { pool } from "../db/db";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. token extract (NO Bearer)
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // 2. verify token
    const decoded = jwt.verify(
      token,
      config.jwt_secret as string,
    ) as jwt.JwtPayload;

    // 3. optional DB check (safe side)
    const userData = await pool.query(
      `SELECT id, name, role FROM users WHERE id=$1`,
      [decoded.id],
    );

    const user = userData.rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // 4. attach user to request
    req.user = {
      id: user.id,
      name: user.name,
      role: user.role,
    };

    // 5. next
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }
};
