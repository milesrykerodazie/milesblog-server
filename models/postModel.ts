import mongoose, { Schema } from 'mongoose';
import { IPost } from '../typescriptInterfaces';

const PostSchema: Schema = new Schema(
   {
      postOwner: {
         type: String,
         required: true,
      },
      role: {
         type: String,
         required: true,
         default: 'Admin',
      },
      title: {
         type: String,
         default: '',
         required: true,
      },
      post: {
         type: String,
      },
      postImage: {
         type: String,
         default: '',
      },
      postSlug: {
         type: String,
         required: true,
      },
      likes: {
         type: Array,
         default: [],
      },
      comments: {
         type: Array,
         default: [],
      },
      tags: {
         type: [String],
         default: ['all'],
      },
      category: {
         type: String,
         default: 'Positive Mindset',
         required: true,
      },
      featured: {
         type: Boolean,
         default: false,
      },
      suspended: {
         type: Boolean,
         default: false,
      },
   },
   { timestamps: true },
);

//export the model
export default mongoose.model<IPost>('Post', PostSchema);
