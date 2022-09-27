import express from 'express';
const router = express.Router();

//import controllers
import { getAllUsers } from '../controllers/userControllers';

//users routes
router.get('/users', getAllUsers);

export default router;
