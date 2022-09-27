import { NextFunction } from 'express';
import mongoose, { Schema } from 'mongoose';
import { UserTypes } from '../typescriptInterfaces';
import bcrypt from 'bcryptjs';

const UserSchema: Schema = new Schema(
   {
      fullName: {
         type: String,
         required: true,
      },
      email: {
         type: String,
         required: true,
         unique: true,
      },
      username: {
         type: String,
         required: true,
         unique: true,
      },
      password: {
         type: String,
         required: true,
      },
      profilePicture: {
         type: String,
         default: '',
      },
      userBio: {
         type: String,
         default: '',
      },
      verified: {
         type: Boolean,
         default: false,
         required: true,
      },
      role: {
         type: String,
         required: true,
         default: 'User',
      },
      active: {
         type: Boolean,
         default: true,
      },
   },
   { timestamps: true },
);

//hash password before saving
UserSchema.pre('save', async function (next) {
   const user = this;
   if (user.isModified('password')) {
      const salt = await bcrypt.genSalt(8);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      user.password = hashedPassword;
   }
   next();
});

//compare the password with the hashed password
UserSchema.methods.comparePassword = async function (
   password: string,
): Promise<Error | boolean> {
   const user = this;
   const passwordMatched = await bcrypt.compare(password, user.password);
   return passwordMatched;
};

//export the model
export default mongoose.model<UserTypes>('User', UserSchema);
