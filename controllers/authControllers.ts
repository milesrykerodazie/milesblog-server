import { Request, response, Response } from 'express';
import User from '../models/userModel';
import {
   emailVerificationTemplate,
   generateOTP,
   mailSending,
   passwordResetSuccessTemplate,
   passwordResetTemplate,
   verificationSuccessTemplate,
} from '../utils/mailer';
import OtpToken from '../models/otpTokenModel';
import ResetPassword from '../models/resetPasswordTokenModel';
import jwt from 'jsonwebtoken';
import { createRandomBytes } from '../utils/helper';
import cloudinary from '../utils/cloudinary';

const access_secret = process.env.ACCESS_TOKEN_SECRET as string;
const refresh_secret = process.env.REFRESH_TOKEN_SECRET as string;
const expire_access = process.env.ACCESS_EXPIRE_SECRET as string;
const expire_refresh = process.env.REFRESH_EXPIRE_SECRET as string;

export const registerUser = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const {
      fullName,
      email,
      username,
      password,
      profilePicture,
      userBio,
      verified,
      role,
      active,
   } = req.body;

   //confirm registration data
   if (
      !fullName.trim() ||
      !email.trim() ||
      !username.trim() ||
      !password.trim()
   ) {
      return res.status(400).json({
         success: false,
         message: 'Please all fields are required.',
      });
   }

   //check for duplicate username and email and ignoring case sensitivity
   const duplicateEmail = await User.findOne({ email }).lean().exec();
   const duplicateUsername = await User.findOne({ username })
      .collation({ locale: 'en', strength: 2 })
      .lean()
      .exec();

   if (duplicateEmail) {
      return res.status(409).json({
         success: false,
         message: 'Email already exists!',
      });
   } else if (duplicateUsername) {
      return res.status(409).json({
         success: false,
         message: 'Username already exists!',
      });
   }

   //generate OTP
   const OTP = generateOTP();

   if (profilePicture) {
      const result = await cloudinary.uploader.upload(profilePicture, {
         folder: 'blog_users_image',
      });
      //finally create the new user on the condition below
      const user = await User.create({
         fullName,
         email,
         username,
         password,
         profilePicture: {
            public_id: result.public_id,
            url: result.secure_url,
         },
         userBio,
         verified,
         role,
         active,
      });
      if (user) {
         // getting and saving the otp generated
         const newOtpToken = new OtpToken({
            username: user?.username,
            otp: OTP,
         });

         newOtpToken.save();

         //sending email
         mailSending().sendMail({
            from: process.env.MAIL,
            to: user?.email,
            subject: 'Email Verification',
            html: emailVerificationTemplate(OTP),
         });

         res.status(201).json({
            success: true,
            message: `${user.fullName}, registration successful.`,
         });

         return;
      } else {
         return res.status(400).json({
            success: false,
            message: 'Invalid user data received,user not created!',
         });
      }
   } else {
      //finally create the new user on the condition below
      const user = await User.create({
         fullName,
         email,
         username,
         password,
         profilePicture,
         userBio,
         verified,
         role,
         active,
      });
      if (user) {
         // getting and saving the otp generated
         const newOtpToken = new OtpToken({
            username: user?.username,
            otp: OTP,
         });

         newOtpToken.save();

         //sending email
         mailSending().sendMail({
            from: process.env.MAIL,
            to: user?.email,
            subject: 'Email Verification',
            html: emailVerificationTemplate(OTP),
         });

         res.status(201).json({
            success: true,
            message: `${user.fullName}, registration successful.`,
         });

         return;
      } else {
         return res.status(400).json({
            success: false,
            message: 'Invalid user data received,user not created!',
         });
      }
   }

   // if(profilePicture){
   //    //sending image to cloudinary
   //    const result = await cloudinary.uploader.upload(profilePicture, {
   //       folder: 'blog_users_image',
   //    });

   // }else{

   // }
};

export const loginUser = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const { email, password }: { email: string; password: string } = req.body;

   if (!email || !password) {
      return res.status(400).json({
         success: false,
         message: 'All fields are required!!',
      });
   }

   const userFound = await User.findOne({ email }).exec();

   if (!userFound || !userFound.active) {
      return res.status(401).json({
         success: false,
         message: 'Not Unauthorized, email does not exist.',
      });
   }

   const passwordMatched = await userFound.comparePassword(password);
   if (!passwordMatched) {
      return res.status(401).json({
         success: false,
         message: 'Unauthorized, Incorrect Password try again.',
      });
   }

   const accessToken = jwt.sign(
      {
         UserCred: {
            roles: userFound.role,
            username: userFound.username,
         },
      },
      access_secret,
      { expiresIn: expire_access },
   );

   const refreshToken = jwt.sign(
      { username: userFound.username },
      refresh_secret,
      {
         expiresIn: expire_refresh,
      },
   );

   //gettin the secure cookie
   res.cookie('astkn', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
   });

   //new access token
   res.json({
      success: `${userFound?.username} logged in`,
      accessToken,
   });
};

export const refreshToken = async (req: Request, res: Response) => {
   const cookies = req.cookies;

   if (!cookies?.astkn)
      return res.status(401).json({ success: false, message: 'Unauthorized' });

   const refreshToken = cookies?.astkn;

   //verifying the token
   jwt.verify(refreshToken, refresh_secret, async (err: any, decoded: any) => {
      if (err) {
         return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      const userFound = await User.findOne({ username: decoded.username });
      if (!userFound)
         return res
            .status(401)
            .json({ success: false, message: 'Unauthorized' });

      //refreshing the access token to get a new one
      const accessToken = jwt.sign(
         {
            UserCred: {
               roles: userFound.role,
               username: userFound.username,
            },
         },
         access_secret,
         { expiresIn: expire_access },
      );
      //new access token
      res.json({
         success: `${userFound?.username} authorized.`,
         accessToken,
      });
   });
};

//logout the user
export const logoutUser = async (req: Request, res: Response) => {
   const cookies = req.cookies;
   if (!cookies?.astkn) return res.sendStatus(204);
   res.clearCookie('astkn', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
   });
   res.status(200).json({
      success: true,
      message: 'You are logged out.',
   });
};

//verify user email

export const verifyUserEmail = async (req: Request, res: Response) => {
   const { username, otp }: { username: string; otp: string } = req.body;

   //checking empty entries
   if (!username.trim() || !otp.trim()) {
      return res.status(400).json({
         success: false,
         message: 'Username/OTP can not be empty',
      });
   }

   const user = await User.findOne({ username: username });
   if (!user) {
      return res.status(404).json({
         success: false,
         message: 'OTP not associated with your account.',
      });
   }

   //checking if user is verified
   if (user.verified) {
      return res.status(409).json({
         success: false,
         message: 'You are already verified.',
      });
   }

   //checking if token exists
   const otpToken = await OtpToken.findOne({
      username: user?.username,
   });

   if (!otpToken) {
      return res.status(404).json({
         success: false,
         message: 'You have no token, you need to request for verification.',
      });
   }

   //comparing the otp token
   const isOtpMatched = await otpToken.compareOtp(otp);
   if (!isOtpMatched) {
      return res.status(403).json({
         success: false,
         message: 'Invalid verification code',
      });
   }
   //if otp matched then update user verified status
   if (isOtpMatched) {
      user.verified = true;
   }

   //after updating the user, delete the token
   await OtpToken.findByIdAndDelete(otpToken._id);
   //save the user verification status
   const verifiedUser = await user.save();
   console.log('verified user: ', verifiedUser);

   //sending verification success mail
   mailSending().sendMail({
      from: process.env.MAIL,
      to: user.email,
      subject: 'Verification Success',
      html: verificationSuccessTemplate(),
   });

   res.json({
      success: true,
      message: `${user?.username}, you have been verified successfully.`,
   });
};

export const forgotPassword = async (req: Request, res: Response) => {
   const { email }: { email: string } = req.body;

   if (!email.trim())
      return res.status(400).json({
         success: false,
         message: 'Email is required.',
      });

   //find if there is a user with that email
   const user = await User.findOne({ email: email }).exec();
   if (!user || !user.active)
      return res.status(401).json({
         success: false,
         message: 'Not Authorized/No user with this email.',
      });

   //finding if user has a reset token already
   const checkUserResetToken = await ResetPassword.findOne({
      userIdentity: user?._id,
   });

   if (checkUserResetToken)
      return res.status(409).json({
         success: false,
         message: 'Check your mail for reset link/Try again in 60mins time',
      });

   // generating the token
   const generatedRandomBytes = await createRandomBytes();

   const newResetToken = new ResetPassword({
      userIdentity: user._id,
      token: generatedRandomBytes,
   });

   const passwordResetLink = `http://localhost:3000/resetpassword?token=${generatedRandomBytes}&id=${user._id}`;

   await newResetToken.save();
   await user.save();

   //sending the mail for resetting the password
   mailSending().sendMail({
      from: process.env.MAIL,
      to: user.email,
      subject: 'Reset Password',
      html: passwordResetTemplate(passwordResetLink),
   });

   res.status(201).json({
      success: true,
      message: `${user.fullName}, your password reset link has been sent to your mail.`,
   });
};

export const resetPassword = async (req: Request, res: Response) => {
   const { password }: { password: string } = req.body;
   if (!password.trim())
      return res
         .status(400)
         .json({ success: false, message: 'Password is required.' });
   // @ts-ignore
   const user = await User.findById(req?.user?._id);
   if (!user)
      return res.status(404).json({
         success: false,
         message: 'User not found.',
      });

   //checking if the password is same with the previous password
   const isPasswordSame = await user.comparePassword(password);
   if (isPasswordSame)
      return res.status(409).json({
         success: false,
         message:
            'Password already exists,your new password must be different.',
      });

   user.password = password.trim();
   await user.save();

   // deleting the reset token from the database
   await ResetPassword.findOneAndDelete({ userIdentity: user._id });

   //sending a success reset mail
   mailSending().sendMail({
      from: process.env.MAIL,
      to: user.email,
      subject: 'Password Reset Successful',
      html: passwordResetSuccessTemplate(),
   });

   res.status(201).json({
      success: true,
      message: `${user.fullName}, your password has been reset successfully.`,
   });
};

export const verifyResetToken = async (req: Request, res: Response) => {
   res.status(200).json({
      success: true,
      message: 'Valid reset token',
   });
};

//request verification
export const requestVerification = async (req: Request, res: Response) => {
   const { username } = req.body;

   // getting user details from database
   const user = await User.findOne({ username: username });
   if (!user) {
      return res.status(404).json({
         success: false,
         message: 'User not found',
      });
   }

   if (user.verified === true) {
      return res.status(409).json({
         success: false,
         message: 'User Email has already been verified',
      });
   }
   //checking if the user is already in the verification token database
   const userCheck = await OtpToken.findOne({
      username: user.username,
   });

   if (userCheck) {
      return res.status(409).json({
         success: false,
         message: 'User still has a valid verification token.',
      });
   }

   //if user has no verification token

   //generating new verification token
   const newOtp: any = generateOTP();

   const freshVerificationToken = new OtpToken({
      username: user.username,
      otp: newOtp,
   });

   await freshVerificationToken.save();

   //send a new mail notification
   mailSending().sendMail({
      from: process.env.MAIL,
      to: user?.email,
      subject: 'Email Verification',
      html: emailVerificationTemplate(newOtp),
   });

   res.status(200).json({
      success: true,
      message: 'Verification sent to mail.',
   });
};
