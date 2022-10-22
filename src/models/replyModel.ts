import mongoose, { Schema } from 'mongoose';
import { IReply } from '../typescriptInterfaces';

const ReplySchema: Schema = new Schema(
   {
      commentId: {
         type: String,
         required: true,
      },
      replyOwner: {
         type: String,
         required: true,
      },
      username: {
         type: String,
         default: '',
      },
      userImage: {
         type: String,
         default: '',
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
export default mongoose.model<IReply>('Reply', ReplySchema);
