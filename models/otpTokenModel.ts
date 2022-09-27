import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { OtpTypes } from '../typescriptInterfaces';

//declare schema
// const schema = mongoose.Schema;

//the verification token schema
const OtpSchema: Schema = new Schema({
   username: {
      type: String,
      required: true,
   },
   otp: {
      type: String,
      required: true,
   },
   createdAt: {
      type: Date,
      expires: 3600,
      default: Date.now,
   },
});

//hashing otp token
OtpSchema.pre('save', async function (next) {
   const otp = this;
   if (otp.isModified('otp')) {
      const salt = await bcrypt.genSalt(8);
      const hashedOtp = await bcrypt.hash(otp.otp, salt);
      otp.otp = hashedOtp;
   }
   next();
});

//comparing the token
OtpSchema.methods.compareOtp = async function (otp: string) {
   const otpToCompare = this;
   const otpMatched = await bcrypt.compare(otp, otpToCompare.otp);
   return otpMatched;
};

export interface IOtpModel extends OtpTypes, Document {}

//export the model
export default mongoose.model<IOtpModel>('OtpToken', OtpSchema);
