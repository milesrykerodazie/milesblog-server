import { Request, Response } from 'express';
import Post from '../models/postModel';

//testing
export const postAll = async (req: Request, res: Response) => {
   return res.status(200).json({
      message: 'hello for the post',
   });
};

//creating a post
export const createPost = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const {
      postOwner,
      role,
      title,
      post,
      postImage,
      postSlug,
      comments,
      tags,
      category,
      featured,
      suspended,
   } = req.body;

   if (!postOwner.trim() || !title.trim() || !postSlug) {
      return res.status(400).json({
         success: false,
         message: 'Please all fields are required.',
      });
   }

   //check for duplicate titles
   const duplicateSlug = await Post.findOne({ postSlug }).lean().exec();
   if (duplicateSlug) {
      return res.status(409).json({
         success: false,
         message: 'Post already exists!',
      });
   }

   const postObject =
      (Array.isArray(tags) || tags?.length) && category !== ''
         ? {
              postOwner,
              role,
              title,
              post,
              postImage,
              postSlug,
              comments,
              featured,
              suspended,
           }
         : {
              postOwner,
              role,
              title,
              post,
              postImage,
              postSlug,
              comments,
              tags,
              category,
              featured,
              suspended,
           };

   const newPost = await Post.create(postObject);

   if (newPost) {
      res.status(201).json({
         success: true,
         message: 'Post created successfully.',
      });
   } else {
      res.status(400).json({
         success: false,
         message: 'Post Not created.',
      });
   }
};
