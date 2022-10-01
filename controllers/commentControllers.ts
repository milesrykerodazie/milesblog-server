import { Request, Response } from 'express';
import Comment from '../models/commentModel';
import Post from '../models/postModel';
import User from '../models/userModel';

//post a comment
export const postComment = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const { postId, commentOwner, comment, replies, likes } = req.body;

   if (!comment || !postId || !commentOwner) {
      return res.status(400).json({
         success: false,
         message: 'Fill in the required fields.',
      });
   }
   //cheking if post exists
   const post = await Post.findById(postId).exec();
   const user = await User.findById(commentOwner).exec();

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

   const commentObject = {
      postId,
      commentOwner,
      comment: comment.trim(),
      replies,
      likes,
   };

   const newComment = await Comment.create(commentObject);

   if (newComment) {
      await post.updateOne({
         $push: { comments: newComment?._id },
      });
      res.status(201).json({
         success: true,
         message: 'Comment sent.',
         comment: newComment,
      });
      return;
   } else {
      return res.status(400).json({
         success: false,
         message: 'Comment not sent.',
      });
   }
};
//edit comment
export const updateComment = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const comment = await Comment.findById(req.body.id).exec();
   if (!comment) {
      return res.status(404).json({
         success: false,
         message: 'Comment not found.',
      });
   }
   const user = await User.findById(req.body.commentOwner).exec();
   if (!user) {
      return res.status(404).json({
         success: false,
         message: 'User not found.',
      });
   }

   if (comment?.commentOwner === req.body.commentOwner) {
      const updatedComment = await comment.updateOne(
         { $set: req.body },
         { new: true },
      );
      res.status(201).json({
         success: true,
         message: 'Comment updated.',
      });
   } else {
      res.status(401).json({
         success: false,
         message: 'You are not authorized to update this comment.',
      });
   }
};
//get all comments
export const getAllComments = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const comments = await Comment.find().sort({ createdAt: -1 }).lean();
   if (comments?.length === 0) {
      return res.status(404).json({
         success: false,
         message: 'No Comments at the moment.',
      });
   }
   //getting the total count of the posts
   const commentsCount = comments?.length;

   if (comments) {
      return res.status(200).json({
         success: true,
         message: 'Posts fetched successfully.',
         comments,
         commentsCount,
      });
   }
};
//get all comments of a post
export const getAllPostComments = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const { postId } = req.body;

   const post = await Post.findById(postId).exec();
   if (!post) {
      return res.status(404).json({
         success: false,
         message: 'Post not found.',
      });
   }
   //get the comments of a post
   const comments = await Comment.find({ postId: postId })
      .sort({ createdAt: -1 })
      .lean();

   if (!comments?.length) {
      return res.status(404).json({
         success: false,
         message: 'No comments available for now.',
      });
   }
   //getting the total count of the comments
   const commentsCount = comments?.length;

   if (comments) {
      return res.status(200).json({
         success: true,
         message: 'Comments by post fetched.',
         comments,
         commentsCount,
      });
   }
};

//get all comments of a user
export const getAllUserComments = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const { userId } = req.body;

   const user = await User.findById(userId).exec();
   if (!user) {
      return res.status(404).json({
         success: false,
         message: 'Post not found.',
      });
   }
   //get the comments of a post
   const comments = await Comment.find({ commentOwner: userId })
      .sort({ createdAt: -1 })
      .lean();

   if (!comments?.length) {
      return res.status(404).json({
         success: false,
         message: 'No comments available for now.',
      });
   }
   //getting the total count of the comments
   const commentsCount = comments?.length;

   if (comments) {
      return res.status(200).json({
         success: true,
         message: 'Comments by user fetched.',
         comments,
         commentsCount,
      });
   }
};

//delete comment
export const deleteComment = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const foundComment = await Comment.findById(req.body.id).exec();
   if (!foundComment) {
      return res.status(404).json({
         success: false,
         message: 'Comment not found.',
      });
   }
   const foundUser = await User.findById(req.body.userId).exec();

   if (!foundUser) {
      return res.status(404).json({
         success: false,
         message: 'User not found.',
      });
   }
   const foundPost = await Post.findById(req.body.postId).exec();

   if (!foundPost) {
      return res.status(404).json({
         success: false,
         message: 'Post not found.',
      });
   }

   if (foundComment?.commentOwner === req.body.userId) {
      await Comment.findByIdAndRemove(req.body.id);
      await Post.findByIdAndUpdate(req.body.postId, {
         $pull: {
            comments: foundComment?._id,
         },
      });
      return res.status(200).json({
         success: true,
         message: 'Comment deleted.',
      });
   } else {
      return res.status(401).json({
         success: true,
         message: 'You are not authorized to delete this comment',
      });
   }
};

//like comment
export const likeAndUnlikeComment = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const { userId, id } = req.body;

   const comment = await Comment.findById(id).exec();
   if (!comment) {
      return res.status(404).json({
         success: false,
         message: 'Comment not found.',
      });
   }
   const user = await User.findById(userId).exec();
   if (!user) {
      return res.status(404).json({
         success: false,
         message: 'User not found.',
      });
   }

   //@ts-expect-error
   if (!comment?.likes?.includes(userId)) {
      const newLike = await comment.updateOne({
         $push: { likes: userId },
      });

      return res.status(201).json({
         success: true,
         message: 'You liked this comment.',
      });
   } else {
      const unLike = await comment.updateOne({
         $pull: { likes: userId },
      });

      return res.status(200).json({
         success: true,
         message: 'You unliked this comment.',
      });
   }
};
