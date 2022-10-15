import express from 'express';
const router = express.Router();

//import controllers
import { getAllUsers, getUser } from '../controllers/userControllers';

//users routes
router.get('/users', getAllUsers);
router.get('/user', getUser);

export default router;
