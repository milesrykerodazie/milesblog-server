import express from 'express';
const router = express.Router();

// importing controllers
import {
   postReply,
   updateReply,
   getAllReplies,
   getReplyReplies,
   getAllUserReplies,
   deleteReply,
   likeAndUnlikeReply,
} from '../controllers/replyORControllers';

//reply routes
router.post('/reply_reply', postReply);
router.patch('/update_reply', updateReply);
router.get('/replies_replies', getAllReplies);
router.get('/reply_replies', getReplyReplies);
router.get('/user_replies', getAllUserReplies);
router.delete('/delete-reply', deleteReply);
router.put('/like_reply', likeAndUnlikeReply);

export default router;
