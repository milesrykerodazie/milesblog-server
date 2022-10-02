import { Request, Response } from 'express';
import ReplyOR from '../models/replyOrModel';
import Reply from '../models/replyModel';
import User from '../models/userModel';

//reply Reply
export const postReply = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const { replyId, replyOwner, reply, replies, likes } = req.body;

   if (!reply || !replyId || !replyOwner) {
      return res.status(400).json({
         success: false,
         message: 'Fill in the required fields.',
      });
   }

   //cheking if Reply exists
   const replyFound = await Reply.findById(replyId).exec();
   if (!replyFound) {
      return res.status(404).json({
         success: false,
         message: 'Reply not found.',
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
      replyId,
      replyOwner,
      reply: reply.trim(),
      replies,
      likes,
   };

   const newReply = await ReplyOR.create(replyObject);

   if (newReply) {
      await replyFound.updateOne({
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
   const replyFound = await ReplyOR.findById(req.body.id).exec();
   if (!replyFound) {
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

   if (replyFound?.replyOwner === req.body.replyOwner) {
      const updatedReply = await replyFound.updateOne(
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
   const replies = await ReplyOR.find().sort({ createdAt: -1 }).lean();
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
//get all replies of a Reply
export const getReplyReplies = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const { replyId } = req.body;

   const reply = await ReplyOR.findById(replyId).exec();
   if (!reply) {
      return res.status(404).json({
         success: false,
         message: 'Reply not found.',
      });
   }
   //get the Replys of a post
   const replies = await ReplyOR.find({ replyId: replyId })
      .sort({ createdAt: -1 })
      .lean();

   if (!replies?.length) {
      return res.status(404).json({
         success: false,
         message: 'No replies available for now.',
      });
   }
   //getting the total count of the Replys
   const repliesCount = replies?.length;

   if (replies) {
      return res.status(200).json({
         success: true,
         message: 'Replys fetched.',
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
   //get the Replys of a post
   const replies = await ReplyOR.find({ replyOwner: userId })
      .sort({ createdAt: -1 })
      .lean();

   if (!replies?.length) {
      return res.status(404).json({
         success: false,
         message: 'No replies available for this user.',
      });
   }
   //getting the total count of the Replys
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
   const foundReply = await ReplyOR.findById(req.body.id).exec();
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

   const foundRep = await Reply.findById(req.body.replyId).exec();

   if (!foundRep) {
      return res.status(404).json({
         success: false,
         message: 'Reply not found.',
      });
   }

   if (foundReply?.replyOwner === req.body.userId) {
      await ReplyOR.findByIdAndRemove(req.body.id);
      await Reply.findByIdAndUpdate(req.body.replyId, {
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

   const reply = await ReplyOR.findById(id).exec();
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
