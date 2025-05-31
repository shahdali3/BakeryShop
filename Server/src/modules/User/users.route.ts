import  { Router } from "express";
import usersService from "./users.service";
import usersValidation from "./user.validation";
import { isAuthenticated } from "../../middleware/auth.middleware";
import { UserRoles } from "./users.interface";

const userRouter : Router =  Router();

// userRouter.use(authService.protectedRoutes, authService.checkActive, authService.allowedTo('admin'))

userRouter.get(
    '/',
    usersService.getAllUsers
)
userRouter.post('/',
    
    usersService.uploadImage,
    usersService.saveImage,
    usersValidation.createOne,
    usersService.createUser)

 userRouter.get('/:id',usersValidation.getOne,usersService.getUserById);
 userRouter.put('/:id', isAuthenticated([UserRoles.MANAGER]), usersService.uploadImage,usersService.updateImage,usersValidation.updateOne,usersService.updateUser);
//  userRouter.put('/:id/changePassword',usersValidation.changePassword,usersService.changePassword);
 userRouter.delete('/:id', isAuthenticated([UserRoles.MANAGER]), usersValidation.deleteOne,usersService.deleteUser);
 userRouter.delete('/:id/image',
    isAuthenticated([UserRoles.MANAGER]),
    usersValidation.deleteOne,
    usersService.deleteUserImage
 )

export default userRouter;


