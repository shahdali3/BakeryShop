import { Router } from "express";
import authValidation from "./auth.validation";
import authService from "./auth.service";
import usersService from "../User/users.service";


const authRouter : Router = Router();


authRouter.post('/signup',usersService.uploadImage,usersService.saveImage,authValidation.signup,authService.signup);
authRouter.post('/login',authValidation.login,authService.login);


export default authRouter;
