import { Request, Response } from 'express';
import User from '../models/userModel';
import cloudinary from '../utils/cloudinary';

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

export const updateUser = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const {
      fullName,
      email,
      username,
      role,
      profilePicture,
      verified,
      userBio,
      active,
   } = req.body;

   const foundUser = await User.findById(req.params.id).exec();
   if (!foundUser) {
      return res.status(404).json({
         success: false,
         message: 'User not found.',
      });
   }

   const duplicateUsername = await User.findOne({ username })
      .collation({ locale: 'en', strength: 2 })
      .lean()
      .exec();

   if (
      duplicateUsername &&
      duplicateUsername?._id.toString() !== req.params.id
   ) {
      return res.status(409).json({
         success: false,
         message: 'Sorry, username already exists, use another',
      });
   }

   if (profilePicture !== undefined) {
      const picId = foundUser.profilePicture.public_id;
      if (picId) {
         await cloudinary.uploader.destroy(picId);
      }
      const newPic = await cloudinary.uploader.upload(profilePicture, {
         folder: 'blog_users_image',
         width: 300,
         crop: 'scale',
      });

      const userObject = {
         fullName,
         email,
         username,
         role,
         profilePicture: {
            public_id: newPic.public_id,
            url: newPic.secure_url,
         },
         verified,
         userBio,
         active,
      };

      if (foundUser?.email === email) {
         const updatedUser = await foundUser.updateOne(
            { $set: userObject },
            { new: true },
         );
         res.status(201).json({
            success: true,
            message: 'User updated successfully.',
         });
      } else {
         res.status(401).json({
            success: false,
            message: 'You are not authorized to update this user.',
         });
      }
   } else {
      const userObject = {
         fullName,
         email,
         username,
         role,
         profilePicture: {
            public_id: foundUser?.profilePicture.public_id,
            url: foundUser?.profilePicture.url,
         },
         verified,
         userBio,
         active,
      };

      if (foundUser?.email === email) {
         const updatedUser = await foundUser.updateOne(
            { $set: userObject },
            { new: true },
         );
         await res.status(201).json({
            success: true,
            message: 'User updated successfully.',
         });
      } else {
         res.status(401).json({
            success: false,
            message: 'You are not authorized to update this user.',
         });
      }
   }
};

// hello
