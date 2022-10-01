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
} from '../controllers/commentControllers';

//comment routes
router.post('/post-comment', postComment);
router.patch('/update-comment', updateComment);
router.get('/comments', getAllComments);
router.get('/post-comments', getAllPostComments);
router.get('/user-comments', getAllUserComments);
router.delete('/delete-comment', deleteComment);
router.put('/like-comment', likeAndUnlikeComment);

export default router;
