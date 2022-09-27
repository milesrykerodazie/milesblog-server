import { Request, Response, NextFunction } from 'express';
import { format } from 'date-fns';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import { v4 as uuid } from 'uuid';
import * as path from 'path';

//helper function to log errors
export const logEvents = async (message: any, logFileName: string) => {
   const dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss');
   const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

   try {
      if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
         await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
      }
      await fsPromises.appendFile(
         path.join(__dirname, '..', 'logs', logFileName),
         logItem,
      );
   } catch (error) {
      console.log(error);
   }
};

//the middleware function
export const logger = (req: Request, res: Response, next: NextFunction) => {
   logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log');
   console.log(`${req.method} ${req.path}`);
   next();
};
