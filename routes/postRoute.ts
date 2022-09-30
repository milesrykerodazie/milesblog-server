import express from 'express';
const router = express.Router();

//import controllers
import {
   postAll,
   createPost,
   allPosts,
   updatePost,
   deletePost,
   getPostBySlug,
   getPostById,
   getPostByCategory,
   getPostByTags,
   likeAndDislikePost,
} from '../controllers/postControllers';

//post routes
router.get('/postcheck', postAll);
router.get('/posts', allPosts);
router.post('/new-post', createPost);
router.patch('/update-post', updatePost);
router.delete('/delete-post', deletePost);
router.get('/post-slug', getPostBySlug);
router.get('/post', getPostById);
router.get('/post-category', getPostByCategory);
router.get('/post-tags', getPostByTags);
router.put('/like-post', likeAndDislikePost);

export default router;
