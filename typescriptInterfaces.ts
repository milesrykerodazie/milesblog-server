import mongoose, { Document } from 'mongoose';

//user types interface
export interface UserTypes extends Document {
   fullName: string;
   username: string;
   email: string;
   password: string;
   role: string;
   profilePicture: {
      public_id: string;
      url: string;
   };
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

export interface IPost extends Document {
   postOwner: string;
   role: string;
   title: string;
   post: string;
   image: {
      public_id: string;
      url: string;
   };
   postSlug: string;
   likes: [];
   comments?: [];
   tags: [];
   category: string;
   featured: boolean;
   suspended: boolean;
   createdAt: Date;
   updatedAt: Date;
}

export interface Icomment extends Document {
   postId: string;
   commentOwner: string;
   username?: string;
   userImage?: string;
   comment: string;
   replies: [];
   likes?: [];
}
export interface IReply extends Document {
   commentId: string;
   replyOwner: string;
   username?: string;
   userImage?: string;
   reply: string;
   replies: [];
   likes: [];
}
export interface IReply_ extends Document {
   replyId: string;
   replyOwner: string;
   reply: string;
   replies: [];
   likes: [];
}
