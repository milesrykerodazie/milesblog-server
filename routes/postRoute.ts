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
   createPostById,
   allPostsForUsers,
   getPostByQueryCategory,
   allPostsWithUserDetails,
} from '../controllers/postControllers';

//post routes
router.get('/postcheck', postAll);
router.get('/admin-posts', allPosts);
router.get('/posts', allPostsForUsers);
router.post('/new-post', createPost);
router.post('/new_post', createPostById);
router.patch('/update-post', updatePost);
router.delete('/delete-post', deletePost);
router.get('/post-slug', getPostBySlug);
router.get('/post', getPostById);
router.get('/post-category', getPostByCategory);
router.get('/post-tags', getPostByTags);
router.put('/like-post', likeAndDislikePost);
router.get('/category-posts', getPostByQueryCategory);
router.get('/post_owner', allPostsWithUserDetails);

export default router;
