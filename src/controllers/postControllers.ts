import { Request, Response } from 'express';
import Post from '../models/postModel';
import User from '../models/userModel';
import Comment from '../models/commentModel';
import cloudinary from '../utils/cloudinary';
import slugify from 'slugify';
import mongoose from 'mongoose';

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

   if (user?.role === '') {
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
         width: 1000,
         crop: 'scale',
      });

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
   const {
      id,
      postOwner,
      role,
      title,
      post,
      image,
      postSlug,
      tags,
      category,
      featured,
      suspended,
   } = req.body;
   const foundPost = await Post.findById(id).exec();

   if (!foundPost) {
      return res.status(404).json({
         success: false,
         message: 'Post not found.',
      });
   }

   //check for duplicate post slug
   const duplicatePostSlug = await Post.findOne({ postSlug: postSlug })
      .collation({ locale: 'en', strength: 2 })
      .lean()
      .exec();

   //allow remaining of the post slug
   if (duplicatePostSlug && duplicatePostSlug?._id.toString() !== id) {
      return res.status(409).json({
         success: false,
         message: 'Duplicate post slug.',
      });
   }

   if (image !== undefined) {
      const imageId = foundPost.image.public_id;
      if (imageId) {
         await cloudinary.uploader.destroy(imageId);
      }
      const newImage = await cloudinary.uploader.upload(image, {
         folder: 'blog_images',
         width: 1000,
         crop: 'scale',
      });
      const updateObject = {
         postOwner,
         role,
         title,
         post,
         image: {
            public_id: newImage.public_id,
            url: newImage.secure_url,
         },
         postSlug,
         tags,
         category,
         featured,
         suspended,
      };

      if (foundPost?.postOwner === postOwner) {
         const updatedPost = await foundPost.updateOne(
            { $set: updateObject },
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
   } else {
      const updateObject = {
         postOwner,
         role,
         title,
         post,
         image: {
            public_id: foundPost.image.public_id,
            url: foundPost.image.url,
         },
         postSlug,
         tags,
         category,
         featured,
         suspended,
      };

      if (foundPost?.postOwner === postOwner) {
         const updatedPost = await foundPost.updateOne(
            { $set: updateObject },
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
      return res.status(400).json({
         success: false,
         message: 'You are not authorized to delete this post.',
      });
   }

   const postImg = foundPost?.image?.public_id;

   if (postImg) {
      await cloudinary.uploader.destroy(postImg);
   }

   await Promise.all(
      (foundPost as any)?.comments.map((comment: any) =>
         Comment.findByIdAndDelete(comment),
      ),
   );

   const deletedPost = await Post.findByIdAndDelete(id);
   res.status(200).json({
      success: true,
      message: 'Post deleted.',
      deletedPost,
   });
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
   const { username, id } = req.body;

   const post = await Post.findOne({ postSlug: id }).exec();
   const user = await User.findOne({ username: username }).exec();

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
   if (!(post as any)?.likes?.includes(username)) {
      const newLike = await post.updateOne({
         $push: { likes: username },
      });

      return res.status(201).json({
         success: true,
         message: 'You liked this post.',
      });
   } else {
      const unLike = await post.updateOne({
         $pull: { likes: username },
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
   const posts = await Post.find().sort({ createdAt: -1 });
   if (posts?.length === 0) {
      return res.status(404).json({
         success: false,
         message: 'No Posts at the moment.',
      });
   }

   const unsuspendedPosts = posts.filter(
      (post) => post?.suspended === false && post?.featured === true,
   );

   // const sorted = unsuspendedPosts.sort(
   //    (a, b) => Number(b.createdAt) - Number(a.createdAt),
   // );

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

//get post by post category query
export const getPostByQueryCategory = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const { category } = req.query;
   const posts = await Post.find({ category: category })
      .collation({ locale: 'en', strength: 2 })
      .sort({ createdAt: -1 })
      .lean();
   if (!posts?.length) {
      return res.status(404).json({
         success: false,
         message: 'No Posts available for this category.',
      });
   } else {
      return res.status(200).json({
         success: true,
         message: 'Post by category fetched.',
         posts,
      });
   }
};

//get all posts
export const allPostsWithUserDetails = async (
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

   const postList = await Promise.all(
      posts.map((post) => {
         return User.findOne(
            { username: (post as any)?.postOwner },
            { fullName: 1, username: 1, profilePicture: 1 },
         );
      }),
   );

   //getting the total count of the posts
   const postsCount = postList?.length;

   if (postList) {
      return res.status(200).json({
         success: true,
         message: 'Posts fetched successfully.',
         posts: postList,
         postsCount,
      });
   }
};

//get post with comments
export const postWithComments = async (req: Request, res: Response) => {
   const { id } = req.params;
   const post = await Post.findOne({ postSlug: id });
   if (!post) {
      return res.status(404).json({
         success: false,
         message: 'Post not found.',
      });
   }

   const commentList = await Promise.all(
      (post as any).comments?.map((comment: any) => {
         if (mongoose.isValidObjectId(comment)) {
            return Comment.findById(comment);
         }
      }),
   );

   if (commentList) {
      const sortedComments = commentList?.sort(
         (a, b) => b?.createdAt - a?.createdAt,
      );

      const commentCount = sortedComments?.length;

      return res.status(200).json({
         success: true,
         postComments: sortedComments,
         commentCount: commentCount,
      });
   } else {
      return res.status(404).json({
         success: false,
         message: 'No comments.',
      });
   }
};
