import { Request, Response } from 'express';
import Comment from '../models/commentModel';
import Reply from '../models/replyModel';
import User from '../models/userModel';

//reply comment
export const postReply = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const { commentId, replyOwner, reply, replies, likes } = req.body;

   if (!reply || !commentId || !replyOwner) {
      return res.status(400).json({
         success: false,
         message: 'Fill in the required fields.',
      });
   }

   //cheking if comment exists
   const comment = await Comment.findById(commentId).exec();
   if (!comment) {
      return res.status(404).json({
         success: false,
         message: 'Comment not found.',
      });
   }
   const user = await User.findById(replyOwner).exec();
   if (!user) {
      return res.status(404).json({
         success: false,
         message: 'User not found.',
      });
   }

   const replyObject = {
      commentId,
      replyOwner,
      reply: reply.trim(),
      replies,
      likes,
   };

   const newReply = await Reply.create(replyObject);

   if (newReply) {
      await comment.updateOne({
         $push: { replies: newReply?._id },
      });
      res.status(201).json({
         success: true,
         message: 'Reply sent.',
         reply: newReply,
      });
      return;
   } else {
      return res.status(400).json({
         success: false,
         message: 'Reply not sent.',
      });
   }
};
//edit reply
export const updateReply = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const reply = await Reply.findById(req.body.id).exec();
   if (!reply) {
      return res.status(404).json({
         success: false,
         message: 'Reply not found.',
      });
   }
   const user = await User.findById(req.body.replyOwner).exec();
   if (!user) {
      return res.status(404).json({
         success: false,
         message: 'User not found.',
      });
   }

   if (reply?.replyOwner === req.body.replyOwner) {
      const updatedReply = await reply.updateOne(
         { $set: req.body },
         { new: true },
      );
      res.status(201).json({
         success: true,
         message: 'Reply updated.',
      });
   } else {
      res.status(401).json({
         success: false,
         message: 'You are not authorized to update this reply.',
      });
   }
};
//get all replies
export const getAllReplies = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const replies = await Reply.find().sort({ createdAt: -1 }).lean();
   if (replies?.length === 0) {
      return res.status(404).json({
         success: false,
         message: 'No replies at the moment.',
      });
   }
   //getting the total count of the posts
   const repliesCount = replies?.length;

   if (replies) {
      return res.status(200).json({
         success: true,
         message: 'Replies fetched successfully.',
         replies,
         repliesCount,
      });
   }
};
//get all replies of a comment
export const getCommentReplies = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const { commentId } = req.body;

   const comment = await Comment.findById(commentId).exec();
   if (!comment) {
      return res.status(404).json({
         success: false,
         message: 'Comment not found.',
      });
   }
   //get the comments of a post
   const replies = await Reply.find({ commentId: commentId })
      .sort({ createdAt: -1 })
      .lean();

   if (!replies?.length) {
      return res.status(404).json({
         success: false,
         message: 'No replies available for now.',
      });
   }
   //getting the total count of the comments
   const repliesCount = replies?.length;

   if (replies) {
      return res.status(200).json({
         success: true,
         message: 'Comments by post fetched.',
         replies,
         repliesCount,
      });
   }
};
//get all replies of a user
export const getAllUserReplies = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const { userId } = req.body;

   const user = await User.findById(userId).exec();
   if (!user) {
      return res.status(404).json({
         success: false,
         message: 'User not found.',
      });
   }
   //get the comments of a post
   const replies = await Reply.find({ replyOwner: userId })
      .sort({ createdAt: -1 })
      .lean();

   if (!replies?.length) {
      return res.status(404).json({
         success: false,
         message: 'No replies available for this user.',
      });
   }
   //getting the total count of the comments
   const repliesCount = replies?.length;

   if (replies) {
      return res.status(200).json({
         success: true,
         message: 'Replies by user fetched.',
         replies,
         repliesCount,
      });
   }
};
//delete reply
export const deleteReply = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const foundReply = await Reply.findById(req.body.id).exec();
   if (!foundReply) {
      return res.status(404).json({
         success: false,
         message: 'Reply not found.',
      });
   }
   const foundUser = await User.findById(req.body.userId).exec();

   if (!foundUser) {
      return res.status(404).json({
         success: false,
         message: 'User not found.',
      });
   }

   const foundComment = await Comment.findById(req.body.commentId).exec();

   if (!foundComment) {
      return res.status(404).json({
         success: false,
         message: 'Comment not found.',
      });
   }

   if (foundReply?.replyOwner === req.body.userId) {
      await Reply.findByIdAndRemove(req.body.id);
      await Comment.findByIdAndUpdate(req.body.commentId, {
         $pull: {
            replies: foundReply?._id,
         },
      });
      return res.status(200).json({
         success: true,
         message: 'Reply deleted.',
      });
   } else {
      return res.status(401).json({
         success: true,
         message: 'You are not authorized to delete this reply',
      });
   }
};

//like reply
export const likeAndUnlikeReply = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const { userId, id } = req.body;

   const reply = await Reply.findById(id).exec();
   if (!reply) {
      return res.status(404).json({
         success: false,
         message: 'Reply not found.',
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
   if (!reply?.likes?.includes(userId)) {
      const newLike = await reply.updateOne({
         $push: { likes: userId },
      });

      return res.status(201).json({
         success: true,
         message: 'You liked this reply.',
      });
   } else {
      const unLike = await reply.updateOne({
         $pull: { likes: userId },
      });

      return res.status(200).json({
         success: true,
         message: 'You unliked this reply.',
      });
   }
};
