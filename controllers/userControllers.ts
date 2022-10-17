import { Request, Response } from 'express';
import User from '../models/userModel';

//get all users
export const getAllUsers = async (req: Request, res: Response) => {
   const users = await User.find({}, { password: 0 }).lean();
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

//get a user
export const getUser = async (req: Request, res: Response) => {
   const { username } = req.body;
   const user = await User.findOne(
      { username: username },
      { password: 0, updatedAt: 0, role: 0 },
   ).exec();
   if (!user) {
      return res
         .status(404)
         .json({ success: false, message: 'User not found' });
   }

   res.status(200).json({
      success: true,
      user,
   });
};

// hello
