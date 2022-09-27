import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ResetPasswordTypes } from '../typescriptInterfaces';

const ResetPasswordSchema: Schema = new Schema({
   userIdentity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
   },
   token: {
      type: String,
      required: true,
   },
   createdAt: {
      type: Date,
      expires: 3600,
      default: Date.now,
   },
});

//hashing verification token
ResetPasswordSchema.pre('save', async function (next) {
   const token = this;
   if (token.isModified('token')) {
      const salt = await bcrypt.genSalt(8);
      const hashedToken = await bcrypt.hash(token.token, salt);
      token.token = hashedToken;
   }
   next();
});

//comparing the token
ResetPasswordSchema.methods.compareToken = async function (token: string) {
   const tokenToCompare = this;
   const tokenMatched = await bcrypt.compare(token, tokenToCompare.token);
   return tokenMatched;
};

export interface IResetPasswordModel extends ResetPasswordTypes, Document {}

export default mongoose.model<IResetPasswordModel>(
   'ResetPassword',
   ResetPasswordSchema,
);
