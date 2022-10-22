import express from 'express';
const router = express.Router();

//import controllers
import {
   getAllUsers,
   getUser,
   updateUser,
   deleteUser,
} from '../controllers/userControllers';

//users routes
router.get('/users', getAllUsers);
router.get('/user', getUser);
router.patch('/update-user', updateUser);
router.delete('/delete-user', deleteUser);

export default router;
