import { Request, Response, NextFunction } from "express";

export function notFoundHandler(_req: Request, res: Response, _next: NextFunction) {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
}
