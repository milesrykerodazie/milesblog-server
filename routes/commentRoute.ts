import express from 'express';
const router = express.Router();

//import controllers
import {
   postComment,
   updateComment,
   getAllComments,
   getAllPostComments,
   getAllUserComments,
   deleteComment,
   likeAndUnlikeComment,
   commentWithReplies,
} from '../controllers/commentControllers';

//comment routes
router.post('/post-comment', postComment);
router.patch('/update-comment', updateComment);
router.get('/comments', getAllComments);
router.get('/post-comments', getAllPostComments);
router.get('/user-comments', getAllUserComments);
router.delete('/delete-comment', deleteComment);
router.patch('/like-comment', likeAndUnlikeComment);
router.get('/comment-replies', commentWithReplies);

export default router;
