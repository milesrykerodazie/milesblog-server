import mongoose, { Schema } from 'mongoose';
import { IReply_ } from '../typescriptInterfaces';

const ReplyORSchema: Schema = new Schema(
   {
      replyId: {
         type: String,
         required: true,
      },
      replyOwner: {
         type: String,
         required: true,
      },
      reply: {
         type: String,
         required: true,
      },
      replies: {
         type: Array,
         default: [],
      },
      likes: {
         type: Array,
         default: [],
      },
   },
   { timestamps: true },
);

//export the model
export default mongoose.model<IReply_>('Comment', ReplyORSchema);
