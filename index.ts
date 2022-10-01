import express, { Express, Request, Response } from 'express';
const app: Express = express();
import 'dotenv/config';
import 'express-async-errors';
import './config/db';
import * as path from 'path';
import mongoose from 'mongoose';
import { logEvents, logger } from './middlewares/logger';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { corsOptions } from './config/corsOptions';
import helmet from 'helmet';
import morgan from 'morgan';

//routes import
import rootRoute from './routes/root';
import authRoute from './routes/authRoute';
import usersRoute from './routes/usersRoute';
import postRoute from './routes/postRoute';
import commentRoute from './routes/commentRoute';

//port
const PORT: number = Number(process.env.PORT) || 9000;
//logger for errors
app.use(logger);

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('common'));
app.use(helmet());

//serve static files
app.use('/', express.static(path.join(__dirname, '/public')));

//api routes start here
app.use('/', rootRoute);
app.use('/milesapi', authRoute);
app.use('/milesapi', usersRoute);
app.use('/milesapi', postRoute);
app.use('/milesapi', commentRoute);

//if user goes to a non existing route
app.all('*', (req: Request, res: Response) => {
   res.status(404);
   if (req.accepts('html')) {
      res.sendFile(path.join(__dirname, 'views', '404.html'));
   } else if (req.accepts('json')) {
      res.status(404).json({
         success: false,
         message: 'Request Not Found',
      });
   } else {
      res.type('txt').send('404 Not Found');
   }
});

//checking if mongodb is online
mongoose.connection.on('connected', () => {
   console.log('MongoDB is live');
});

//checking if mongodb is disconnected
mongoose.connection.on('disconnected', () => {
   console.log(
      'MongoDB is disconnected, check your connection or database network access',
   );
});

mongoose.connection.once('open', () => {
   console.log('MongoDB is connected');
   app.listen(PORT, () => console.log(`server running on ${PORT}`));
});

mongoose.connection.on('error', (err) => {
   console.log(err);
   logEvents(
      `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
      'mongoErrLog.log',
   );
});
