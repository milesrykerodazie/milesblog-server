import { Request, Response, NextFunction } from 'express';
import { logEvents } from './logger.js';

//error handler middleware
export const errorHandler = (
   error: any,
   req: Request,
   res: Response,
   next: NextFunction,
) => {
   logEvents(
      `${error.name}: ${error.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      'errorLog.log',
   );

   const status = res.statusCode ? res.statusCode : 500;

   res.status(status).json({
      success: false,
      message: error.message,
      isError: true,
   });
};
