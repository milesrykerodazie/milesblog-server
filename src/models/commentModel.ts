import mongoose, { Schema } from 'mongoose';
import { Icomment } from '../typescriptInterfaces';

const CommentSchema: Schema = new Schema(
   {
      postId: {
         type: String,
         required: true,
      },
      commentOwner: {
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
      comment: {
         type: String,
         required: true,
      },
      replies: {
         type: [String],
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
export default mongoose.model<Icomment>('Comment', CommentSchema);
