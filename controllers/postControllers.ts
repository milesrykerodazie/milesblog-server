import { Request, Response } from 'express';
import Post from '../models/postModel';
import User from '../models/userModel';
import cloudinary from '../utils/cloudinary';
import slugify from 'slugify';

//testing
export const postAll = async (req: Request, res: Response) => {
   return res.status(200).json({
      message: 'hello for the post',
   });
};

//creating a post
export const createPost = async (req: Request, res: Response) => {
   const {
      postOwner,
      role,
      title,
      post,
      image,
      postSlug,
      likes,
      comments,
      tags,
      category,
      featured,
      suspended,
   } = req.body;

   if (!postOwner || !title) {
      return res.status(400).json({
         success: false,
         message: 'Please fill in the required fields.',
      });
   }

   //generating the title slug from title
   const options = {
      replacement: '-',
      remove: /[*+~.()'"!:@]/g,
      lower: true,
      strict: false,
      locale: 'en',
      trim: true,
   };
   const slugTitle = slugify(title, options);

   const user = await User.findOne({ username: postOwner }).lean();

   if (user?.role !== 'Admin') {
      return res.status(401).json({
         success: false,
         message: 'You are not authorized to create a post.',
      });
   }

   //check for duplicate titles

   const duplicateSlug = await Post.findOne({ postSlug: slugTitle })
      .collation({ locale: 'en', strength: 2 })
      .exec();
   if (duplicateSlug) {
      return res.status(409).json({
         success: false,
         message: 'Post already exists!',
      });
   }

   if (image) {
      //sending image to cloudinary
      const result = await cloudinary.uploader.upload(image, {
         folder: 'blog_images',
      });
      console.log('cloud results: => ', result);
      const newPost = await Post.create({
         postOwner,
         role,
         title,
         post,
         image: {
            public_id: result.public_id,
            url: result.secure_url,
         },
         postSlug: slugTitle,
         likes,
         comments,
         tags,
         category,
         featured,
         suspended,
      });
      console.log('new post here: => ', newPost);
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
   } else {
      const newPost = await Post.create({
         postOwner,
         role,
         title,
         post,
         image,
         postSlug: slugTitle,
         likes,
         comments,
         tags,
         category,
         featured,
         suspended,
      });
      console.log('new post here: => ', newPost);
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
   }
};

//get all posts
export const allPosts = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const posts = await Post.find().sort({ createdAt: -1 }).lean();
   if (posts?.length === 0) {
      return res.status(404).json({
         success: false,
         message: 'No Posts at the moment.',
      });
   }
   //getting the total count of the posts
   const postsCount = posts?.length;

   if (posts) {
      return res.status(200).json({
         success: true,
         message: 'Posts fetched successfully.',
         posts,
         postsCount,
      });
   }
};

//update a post
export const updatePost = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const foundPost = await Post.findById(req.body.id).exec();

   if (!foundPost) {
      return res.status(404).json({
         success: false,
         message: 'Post not found.',
      });
   }

   //check for duplicate post slug
   const duplicatePostSlug = await Post.findOne({ postSlug: req.body.postSlug })
      .collation({ locale: 'en', strength: 2 })
      .lean()
      .exec();

   //allow remaining of the post slug
   if (duplicatePostSlug && duplicatePostSlug?._id.toString() !== req.body.id) {
      return res.status(409).json({
         success: false,
         message: 'Duplicate post slug.',
      });
   }

   if (foundPost?.postOwner === req.body.postOwner) {
      const updatedPost = await foundPost.updateOne(
         { $set: req.body },
         { new: true },
      );
      res.status(201).json({
         success: true,
         message: 'Post updated successfully.',
         post: updatedPost,
      });
   } else {
      res.status(401).json({
         success: false,
         message: 'You are not authorized to update this post.',
      });
   }
};
//delete a post
export const deletePost = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const { id, postOwner } = req.body;
   const foundPost = await Post.findById(id).exec();

   if (!foundPost) {
      return res.status(404).json({
         success: false,
         message: 'Post not found.',
      });
   }

   if (foundPost?.postOwner === postOwner) {
      await Post.deleteOne();
      res.status(200).json({
         success: true,
         message: 'Post deleted.',
      });
   } else {
      res.status(400).json({
         success: false,
         message: 'You are not authorized to delete this post.',
      });
   }
};

//get post by post slug
export const getPostBySlug = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const { postSlug } = req.body;

   // get post by slug
   const post = await Post.findOne({ postSlug })
      .collation({ locale: 'en', strength: 2 })
      .lean();

   if (!post) {
      return res.status(404).json({
         success: false,
         message: 'Post not found.',
      });
   } else {
      return res.status(200).json({
         success: true,
         message: 'Post Fetched.',
         post,
      });
   }
};

//get post by post id
export const getPostById = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const { id } = req.body;

   // get post by slug
   const post = await Post.findById(id).exec();

   if (!post) {
      return res.status(404).json({
         success: false,
         message: 'Post not found.',
      });
   } else {
      return res.status(200).json({
         success: true,
         message: 'Post Fetched.',
         post,
      });
   }
};

//get post by post category
export const getPostByCategory = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const { category } = req.body;
   const posts = await Post.find({ category: category })
      .collation({ locale: 'en', strength: 2 })
      .sort({ createdAt: -1 })
      .lean();
   if (!posts?.length) {
      return res.status(404).json({
         success: false,
         message: 'No Posts available for now.',
      });
   } else {
      return res.status(200).json({
         success: true,
         message: 'Post by category fetched.',
         posts,
      });
   }
};

//get post by post tags
export const getPostByTags = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const { tags } = req.body;
   const posts = await Post.find({ tags: { $all: tags } })
      .collation({ locale: 'en', strength: 2 })
      .sort({ createdAt: -1 })
      .lean();
   if (!posts?.length) {
      return res.status(404).json({
         success: false,
         message: 'No Posts available for now.',
      });
   } else {
      return res.status(200).json({
         success: true,
         message: 'Post by tags fetched.',
         posts,
      });
   }
};

//like a post
export const likeAndDislikePost = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const { userId, id } = req.body;

   const post = await Post.findById(id).exec();
   const user = await User.findById(userId).exec();

   if (!post) {
      return res.status(404).json({
         success: false,
         message: 'Post not found.',
      });
   }
   if (!user) {
      return res.status(404).json({
         success: false,
         message: 'User not found.',
      });
   }
   //@ts-expect-error
   if (!post?.likes?.includes(userId)) {
      const newLike = await post.updateOne({
         $push: { likes: userId },
      });

      return res.status(201).json({
         success: true,
         message: 'You liked this post.',
      });
   } else {
      const unLike = await post.updateOne({
         $pull: { likes: userId },
      });

      return res.status(200).json({
         success: true,
         message: 'You unliked this post.',
      });
   }
};

//creating a post by username
export const createPostById = async (req: Request, res: Response) => {
   const {
      postOwner,
      role,
      title,
      post,
      image,
      postSlug,
      likes,
      comments,
      tags,
      category,
      featured,
      suspended,
   } = req.body;

   if (!postOwner || !title) {
      return res.status(400).json({
         success: false,
         message: 'Please all fields are required.',
      });
   }

   const user = await User.findById(postOwner).exec();

   const options = {
      replacement: '-',
      remove: /[*+~.()'"!:@]/g,
      lower: true,
      strict: false,
      locale: 'en',
      trim: true,
   };

   const slugTitle = slugify(title, options);

   console.log('slugged title: => ', slugTitle);

   console.log('username user: =>', user);

   if (user?.role !== 'Admin') {
      return res.status(401).json({
         success: false,
         message: 'You are not authorized to create a post.',
      });
   }

   //check for duplicate titles

   const duplicateSlug = await Post.findOne({ postSlug: slugTitle })
      .collation({ locale: 'en', strength: 2 })
      .exec();
   if (duplicateSlug) {
      return res.status(409).json({
         success: false,
         message: 'Post already exists!',
      });
   }

   if (image) {
      //sending image to cloudinary
      const result = await cloudinary.uploader.upload(image, {
         folder: 'blog_images',
      });
      console.log('cloud results: => ', result);
      const newPost = await Post.create({
         postOwner,
         role,
         title,
         post,
         image: {
            public_id: result.public_id,
            url: result.secure_url,
         },
         postSlug: slugTitle,
         likes,
         comments,
         tags,
         category,
         featured,
         suspended,
      });
      console.log('new post here: => ', newPost);
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
   } else {
      const newPost = await Post.create({
         postOwner,
         role,
         title,
         post,
         image,
         postSlug: slugTitle,
         likes,
         comments,
         tags,
         category,
         featured,
         suspended,
      });
      console.log('new post here: => ', newPost);
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
   }
};

//get all posts that are not suspended
export const allPostsForUsers = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const posts = await Post.find().sort({ createdAt: -1 }).lean();
   if (posts?.length === 0) {
      return res.status(404).json({
         success: false,
         message: 'No Posts at the moment.',
      });
   }

   const unsuspendedPosts = posts.filter((post) => post?.suspended === false);

   //getting the total count of the posts
   const postsCount = unsuspendedPosts?.length;

   if (unsuspendedPosts) {
      return res.status(200).json({
         success: true,
         message: 'Posts fetched successfully.',
         posts: unsuspendedPosts,
         postsCount,
      });
   }
};
