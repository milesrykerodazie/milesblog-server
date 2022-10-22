import { Request, Response } from 'express';
import User from '../models/userModel';
import cloudinary from '../utils/cloudinary';
import Post from '../models/postModel';
import Reply from '../models/replyModel';
import Comment from '../models/commentModel';

//get all users
export const getAllUsers = async (req: Request, res: Response) => {
   const users = await User.find({}, { password: 0 }).lean();
   if (!users?.length) {
      return res
         .status(400)
         .json({ success: false, message: 'There are no users at the moment' });
   }

   const totalUsers = users.length;
   res.status(200).json({
      success: true,
      users,
      total_num_of_users: totalUsers,
   });
};

//get a user
export const getUser = async (req: Request, res: Response) => {
   const { username } = req.body;
   const user = await User.findOne(
      { username: username },
      { password: 0, updatedAt: 0, role: 0 },
   ).exec();
   if (!user) {
      return res
         .status(404)
         .json({ success: false, message: 'User not found' });
   }

   res.status(200).json({
      success: true,
      user,
   });
};

export const updateUser = async (
   req: Request,
   res: Response,
): Promise<Response | void> => {
   const {
      id,
      fullName,
      email,
      username,
      role,
      profilePicture,
      verified,
      userBio,
      active,
   } = req.body;

   const foundUser = await User.findById(id).exec();
   if (!foundUser) {
      return res.status(404).json({
         success: false,
         message: 'User not found.',
      });
   }

   const duplicateUsername = await User.findOne({ username })
      .collation({ locale: 'en', strength: 2 })
      .lean()
      .exec();

   if (duplicateUsername && duplicateUsername?._id.toString() !== id) {
      return res.status(409).json({
         success: false,
         message: 'Sorry, username already exists, use another',
      });
   }

   if (profilePicture !== undefined) {
      const picId = foundUser.profilePicture.public_id;
      if (picId) {
         await cloudinary.uploader.destroy(picId);
      }
      const newPic = await cloudinary.uploader.upload(profilePicture, {
         folder: 'blog_users_image',
         width: 300,
         crop: 'scale',
      });

      const userObject = {
         fullName,
         email,
         username,
         role,
         profilePicture: {
            public_id: newPic.public_id,
            url: newPic.secure_url,
         },
         verified,
         userBio,
         active,
      };

      if (foundUser?.email === email) {
         const updatedUser = await foundUser.updateOne(
            { $set: userObject },
            { new: true },
         );
         res.status(201).json({
            success: true,
            message: 'User updated successfully.',
         });
      } else {
         res.status(401).json({
            success: false,
            message: 'You are not authorized to update this user.',
         });
      }
   } else {
      const userObject = {
         fullName,
         email,
         username,
         role,
         profilePicture: {
            public_id: foundUser?.profilePicture.public_id,
            url: foundUser?.profilePicture.url,
         },
         verified,
         userBio,
         active,
      };

      if (foundUser?.email === email) {
         const updatedUser = await foundUser.updateOne(
            { $set: userObject },
            { new: true },
         );
         await res.status(201).json({
            success: true,
            message: 'User updated successfully.',
         });
      } else {
         res.status(401).json({
            success: false,
            message: 'You are not authorized to update this user.',
         });
      }
   }
};

//delete user
// export const deleteUser = async (req: Request, res: Response) => {
//    const { id } = req.body;

//    const foundUser = await User.findById(id).exec();

//    const foundPosts = await Post.find({ postOwner: foundUser?.username });

//    const foundComments = await Comment.find({
//       commentOwner: foundUser?.username,
//    });

//    const foundReplies = await Reply.find({ replyOwner: foundUser?.username });

//    const userImage = foundUser?.profilePicture?.public_id;
//    if (userImage) {
//       await cloudinary.uploader.destroy(userImage);
//    }

//    //delete post
//    await Promise.all(
//       (foundPosts as any)?.map(
//          async (foundPost: any) => (
//             foundPost?.comments?.map((comment: any) =>
//                Comment.findByIdAndDelete(comment),
//             ),
//             await cloudinary.uploader.destroy(foundPost?.image?.public_id),
//             Post.findByIdAndDelete(foundPost?._id)
//          ),
//       ),
//    );

//    const allPosts = await Post.find();

//    //delete comments
//    await Promise.all(
//       (foundComments as any)?.map(
//          (foundComment: any) => (
//             foundComment?.replies?.map((reply: any) =>
//                Reply.findByIdAndDelete(reply),
//             ),
//             allPosts?.map(async (post) => {
//                if (post && post?.comments) {
//                   const commentIncludes = post?.comments.includes(
//                      //@ts-expect-error
//                      foundComment?._id,
//                   );
//                   if (commentIncludes) {
//                      return await Post.findByIdAndUpdate(post?._id, {
//                         $pull: {
//                            comments: foundComment?._id,
//                         },
//                      });
//                   }
//                }
//             }),
//             Comment.findByIdAndDelete(foundComment?._id)
//          ),
//       ),
//    );

//    await Promise.all(
//       (foundReplies as any)?.map((foundReply: any) =>
//          Reply.findByIdAndDelete(foundReply?._id),
//       ),
//    );

//    await User.findByIdAndDelete(foundUser?._id);

//    res.status(200).json({
//       success: true,
//       message: 'User deleted.',
//    });
// };

export const deleteUser = async (req: Request, res: Response) => {
   const { id } = req.body;

   const foundUser = await User.findById(id);

   if (foundUser) {
      const foundPosts = await Post.find({ postOwner: foundUser?.username });
      const foundComments = await Comment.find({
         commentOwner: foundUser?.username,
      });
      const foundReplies = await Reply.find({
         replyOwner: foundUser?.username,
      });
      const allPosts = await Post.find();
      const allComments = await Comment.find();
      const allReplies = await Reply.find();

      //deleting users posts and all with it
      if (foundPosts)
         await Promise.all(
            foundPosts?.map(async (post) => {
               if (post) {
                  post?.comments?.map((comment) => {
                     Comment.findByIdAndDelete(comment);
                  });
                  await cloudinary.uploader.destroy(post?.image?.public_id);
                  await Post.findByIdAndDelete(post?._id);
               }
            }),
         );

      //deleting all users comments
      if (foundComments)
         await Promise.all(
            foundComments?.map(async (comment) => {
               comment?.replies.map(async (reply) => {
                  if (reply) await Reply.findByIdAndDelete(reply);
               });
               if (comment) {
                  allPosts?.map(async (post) => {
                     if (
                        // @ts-expect-error
                        post?.comments?.includes(comment?._id.toHexString())
                     ) {
                        await Post.findByIdAndUpdate(post?._id, {
                           $pull: {
                              comments: comment?._id.toHexString(),
                           },
                        });
                     }
                  });
               }
               await Comment.findByIdAndDelete(comment?._id);
            }),
         );

      //remove all user likes from posts
      if (allPosts)
         await Promise.all(
            allPosts?.map(async (post) => {
               // @ts-expect-error
               if (post?.likes?.includes(foundUser?.username)) {
                  await Post.findByIdAndUpdate(post?._id, {
                     $pull: {
                        likes: foundUser?.username,
                     },
                  });
               }
            }),
         );

      //delete user replies
      if (foundReplies)
         await Promise.all(
            foundReplies?.map(async (reply) => {
               if (allComments) {
                  allComments?.map(async (comment) => {
                     // @ts-expect-error
                     if (comment?.replies?.includes(reply?._id.toHexString())) {
                        await Comment.findByIdAndUpdate(comment?._id, {
                           $pull: {
                              replies: reply?._id.toHexString(),
                           },
                        });
                     }
                  });
               }
               await Reply.findByIdAndDelete(reply?._id);
            }),
         );
      //remoming user likes from comment
      if (allComments)
         await Promise.all(
            allComments?.map(async (comment) => {
               // @ts-expect-error
               if (comment?.likes?.includes(foundUser?.username)) {
                  await Comment.findByIdAndUpdate(comment?._id, {
                     $pull: {
                        likes: foundUser?.username,
                     },
                  });
               }
            }),
         );

      //removing user likes from replies
      if (allReplies)
         await Promise.all(
            allReplies?.map(async (reply) => {
               // @ts-expect-error
               if (reply?.likes?.includes(foundUser?.username)) {
                  await Reply.findByIdAndUpdate(reply?._id, {
                     $pull: {
                        likes: foundUser?.username,
                     },
                  });
               }
            }),
         );

      //deleting user image from cloud
      if (foundUser?.profilePicture?.public_id) {
         await cloudinary.uploader.destroy(
            foundUser?.profilePicture?.public_id,
         );
      }

      await User.findByIdAndDelete(foundUser?._id);

      res.status(200).json({
         success: true,
         message: 'Deleted.',
      });
   }
};
