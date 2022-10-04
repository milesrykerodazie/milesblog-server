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
         trim: true,
      },
      title: {
         type: String,
         default: '',
         required: true,
         trim: true,
      },
      post: {
         type: String,
         default: '',
         trim: true,
      },
      image: {
         public_id: {
            type: String,
            default: '',
         },
         url: {
            type: String,
            default: '',
         },
      },
      postSlug: {
         type: String,
         required: true,
         lowercase: true,
         trim: true,
      },
      likes: {
         type: Array,
         default: [],
      },
      comments: {
         type: [String],
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
         lowercase: true,
         trim: true,
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
