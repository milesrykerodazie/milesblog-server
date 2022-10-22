import express from 'express';
const router = express.Router();

// importing controllers
import {
   postReply,
   updateReply,
   getAllReplies,
   getCommentReplies,
   getAllUserReplies,
   deleteReply,
   likeAndUnlikeReply,
} from '../controllers/replyControllers';

//reply routes
router.post('/reply-comment', postReply);
router.patch('/update-reply', updateReply);
router.get('/replies', getAllReplies);
router.get('/comment-replies', getCommentReplies);
router.get('/user-replies', getAllUserReplies);
router.delete('/delete-reply', deleteReply);
router.patch('/like-reply', likeAndUnlikeReply);

export default router;
