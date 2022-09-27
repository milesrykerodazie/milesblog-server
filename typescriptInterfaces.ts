import mongoose, { Document } from 'mongoose';

//user types interface
export interface UserTypes extends Document {
   fullName: string;
   username: string;
   email: string;
   password: string;
   roles: string;
   profilePicture: string;
   userBio: string;
   verified: boolean;
   active: boolean;
   createdAt: Date;
   updatedAt: Date;
   comparePassword(password: string): Promise<Error | boolean>;
}

export interface OtpTypes {
   username: string;
   otp: string;
   createdAt: Date;
   compareOtp(otp: string): Promise<boolean>;
}

export interface ResetPasswordTypes {
   userIdentity: mongoose.Schema.Types.ObjectId;
   token: string;
   createdAt: Date;
   compareToken(token: string): Promise<boolean>;
}
