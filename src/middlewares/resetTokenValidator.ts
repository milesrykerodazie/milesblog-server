import mongoose from 'mongoose';
import { NextFunction, Request, Response } from 'express';

import User from '../models/userModel';
import ResetPassword from '../models/resetPasswordTokenModel';

export const isResetTokenValid = async (
   req: Request,
   res: Response,
   next: NextFunction,
) => {
   const { token, id } = req?.query;
   if (!token || !id)
      return res.status(400).json({
         success: false,
         message: 'Token/Id can not be empty.',
      });

   if (!mongoose.isValidObjectId(id))
      return res.status(400).json({
         success: false,
         message: 'Invalid User Id.',
      });

   //finding the user
   const user = await User.findById(id);
   if (!user)
      return res.status(404).json({
         success: false,
         message: 'User not found, due to invalid Id.',
      });

   //checking if user has a reset token
   const userResetToken = await ResetPassword.findOne({
      userIdentity: user._id,
   });

   if (!userResetToken)
      return res.status(404).json({
         success: false,
         message: 'Reset Token Not Found.',
      });

   //   checking if the token in query matched the token in the db
   const isTokenMatched = await userResetToken.compareToken(token as string);

   if (!isTokenMatched)
      return res.status(409).json({
         success: false,
         message: 'Invalid password reset token.',
      });

   // @ts-ignore
   req.user = user;
   next();
};
