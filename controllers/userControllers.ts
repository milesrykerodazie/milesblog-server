import { Request, Response } from 'express';
import User from '../models/userModel';

//get all users
export const getAllUsers = async (req: Request, res: Response) => {
   const users = await User.find().select('-password, -updatedAt').lean();
   if (!users?.length) {
      return res
         .status(400)
         .json({ success: false, message: 'There are no users at the moment' });
   }

   const totalUsers = users.length;
   res.status(200).json({
      success: true,
      users,
      total_num_of_users: totalUsers,
   });
};
