import express from 'express';
const router = express.Router();

//import controllers
import {
   postAll,
   createPost,
   allPosts,
   updatePost,
   deletePost,
} from '../controllers/postControllers';

//post routes
router.get('/postcheck', postAll);
router.get('/posts', allPosts);
router.post('/new-post', createPost);
router.patch('/update-post', updatePost);
router.delete('/delete-post', deletePost);

export default router;
