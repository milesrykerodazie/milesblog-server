import { whiteListOrigins } from './whiteListOrigins';

export const corsOptions = {
   origin: (origin: any, callback: any) => {
      if (whiteListOrigins.indexOf(origin) !== -1 || !origin) {
         callback(null, true);
      } else {
         callback(new Error('Not allowed by CORS'));
      }
   },
   credentials: true,
   optionsSuccessStatus: 200,
};
