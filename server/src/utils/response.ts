import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  errors?: any;
}

export const successResponse = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200,
  pagination?: ApiResponse['pagination']
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(pagination ? { pagination } : {}),
  });
};

export const errorResponse = (
  res: Response,
  message = 'Internal Server Error',
  statusCode = 500,
  errors?: any
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};
