import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/config";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. token extract from header
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

    // 3. attach user to request
    req.user = {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role,
    };

    // 4. go to next middleware/controller
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }
};
