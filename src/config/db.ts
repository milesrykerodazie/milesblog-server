import mongoose, { ConnectOptions } from 'mongoose';

const dbUri = process.env.MONGODB_URL as string;

mongoose
   .connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
   } as ConnectOptions)
   .then(() => console.log('Connected to MongoDB'))
   .catch((error) => console.log(`Error connecting to MongoDB ${error}`));
