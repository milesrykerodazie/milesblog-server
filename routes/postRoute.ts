import express from 'express';
const router = express.Router();

//import controllers
import { postAll, createPost } from '../controllers/postControllers';

//post routes
router.get('/posts', postAll);
router.post('/new-post', createPost);

export default router;
