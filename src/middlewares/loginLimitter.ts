import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { logEvents } from './logger';

const loginLimiter = rateLimit({
   windowMs: 60 * 1000,
   max: 5,
   message: {
      message:
         'Too many login attempts from this Ip, Please try again after a minute',
   },
   handler: (req: Request, res: Response, next: NextFunction, options) => {
      logEvents(
         `Too many requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
         'error.log',
      );
      res.status(options.statusCode).send(options.message);
   },
   standardHeaders: true,
   legacyHeaders: false,
});

export default loginLimiter;
