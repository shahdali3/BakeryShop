import expressAsyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import usersSchema from "../User/users.schema";
import bcrypt from "bcryptjs";
import sanitization from "../../utils/sanitization";
import jwt from "jsonwebtoken"
import sendEmail from "../../utils/sendMail";
import ApiError from "../../utils/apiErrors";

class AuthService {

    signup = expressAsyncHandler(async(req:Request, res:Response, next:NextFunction) => {
        
        const user = await usersSchema.create({

            username: req.body.username,
            name: req.body.name,
            password: req.body.password,
            // email: req.body.email,
            image: req.body.image,
            role: req.body.role
        });

        const token = jwt.sign({_id: user._id , role: user.role},process.env.JWT_SECRET!)
        res.status(201).json({message:"User created successfully", token, data: sanitization.User(user)});

    });

    // signup = expressAsyncHandler(async(req:Request, res:Response, next:NextFunction) => {
        

    //     const user = await usersSchema.create({

    //         username: req.body.username,
    //         name: req.body.name,
    //         password: req.body.password,
    //         email: req.body.email,
    //         image: req.body.image
    //     });

    //     const token = createTokens.accessToken(user._id, user.role);
    //     res.status(201).json({message:"User created successfully", token, data: sanitization.User(user)});

    // });


    login = expressAsyncHandler(async(req:Request, res:Response, next:NextFunction) => {
        const user = await usersSchema.findOne({ username: req.body.username });
    
        if(!user || user.hasPassword === false || !(await bcrypt.compare(req.body.password, user.password))) {
            return next(new ApiError(`${req.__('validation_email_password')}`, 400));
        }
    
        const token = jwt.sign({userId: user._id, role: user.role}, process.env.JWT_SECRET!);
        res.status(200).json({message: "User logged in successfully", token, data: sanitization.User(user)});
    });

    // login = expressAsyncHandler(async(req:Request, res:Response, next:NextFunction) => {

    //     const user = await usersSchema.findOne({$or: [{username: req.body.username},{email: req.body.email}]});

    //     if(!user|| user.hasPassword == false || !(await bcrypt.compare(req.body.password, user.password)))
    //           return next(new ApiError(`${req.__('validation_email_password')}`, 400));
            
    //     const token = createTokens.accessToken(user._id, user.role);
    //     res.status(200).json({message:"User logged in successfully", token, data: sanitization.User(user)});
    // });

    adminLogin = expressAsyncHandler(async(req:Request, res:Response, next:NextFunction) => {

        const user = await usersSchema.findOne({

            $or: [{username: req.body.username},{email: req.body.email}],
            role: {$in: ['admin', 'employee']}
        });

        if(!user || user.hasPassword == false || !(await bcrypt.compare(req.body.password, user.password)))
            return next (new ApiError(`${req.__('invalid_login')}`, 400));

        const token = jwt.sign({_id: user._id, role: user.role}, process.env.JWT_SECRET!);
        res.status(200).json({message:"Admin logged in successfully", token, data: sanitization.User(user)});
});


//     adminLogin = expressAsyncHandler(async(req:Request, res:Response, next:NextFunction) => {

//         const user = await usersSchema.findOne({

//             $or: [{username: req.body.username},{email: req.body.email}],
//             role: {$in: ['admin', 'employee']}
//         });

//         if(!user || user.hasPassword == false || !(await bcrypt.compare(req.body.password, user.password)))
//             return next (new ApiError(`${req.__('invalid_login')}`, 400));

//         const token = createTokens.accessToken(user._id, user.role);
//         res.status(200).json({message:"Admin logged in successfully", token, data: sanitization.User(user)});
// });

////////////////////////////////////////////////////////////////////////////

protectedRoutes = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['token'] as string | undefined;
    // console.log(token)

    // Check if token is provided
    if (!token) {
        return next(new ApiError(`${req.__('check_login')}`, 401));
    }

    // Verify the token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    // console.log(decoded)
    
    // Find user by ID
    const user = await usersSchema.findById(decoded._id);
    // console.log(user)
    // Check if user exists
    if (!user) {
        return next(new ApiError(`${req.__('check_login')}`, 404));
    }

    // Check if the password has been changed
    if (user.passwordChangedAt instanceof Date) {
        const changePasswordTime = Math.trunc(user.passwordChangedAt.getTime() / 1000);
        if (changePasswordTime > decoded.iat) {
            return next(new ApiError(`${req.__('check_password_changed')}`, 401));
        }
    }

    // Attach user to the request
    req.user = user;
    next();
});





forgetPassword = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user: any = await usersSchema.findOne({email: req.body.email});
    if (!user) return next(new ApiError(`${req.__('check_email')}`, 404));

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    // const cryptedCode = await bcrypt.hash(resetCode, 13);

    const cryptedCode = crypto.createHash('sha256').update(resetCode).digest('hex');
    const message = `Your reset code is: ${resetCode}`;
    const options = {
        message,
        email: user.email,
        subject: 'Reset password'
    }
    try {
        await sendEmail(options);
        user.passwordResetCode = cryptedCode;
        user.passwordResetCodeExpires = Date.now() + (10 * 60 * 1000);
        user.passwordResetCodeVerify = false;
        if (user.image && user.image.startsWith(`${process.env.BASE_URL}`)) user.image = user.image.split('/').pop();
        await user.save({validateModifiedOnly: true});
    } catch (e) {
        console.log(e);
        return next(new ApiError(`${req.__('send_email')}`, 500)); // error server
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_RESET!);
    res.status(200).json({token, success: true});
})


// forgetPassword = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
//     const user: any = await usersSchema.findOne({email: req.body.email});
//     if (!user) return next(new ApiError(`${req.__('check_email')}`, 404));

//     const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
//     // const cryptedCode = await bcrypt.hash(resetCode, 13);

//     const cryptedCode = crypto.createHash('sha256').update(resetCode).digest('hex');
//     const message = `Your reset code is: ${resetCode}`;
//     const options = {
//         message,
//         email: user.email,
//         subject: 'Reset password'
//     }
//     try {
//         await sendEmail(options);
//         user.passwordResetCode = cryptedCode;
//         user.passwordResetCodeExpires = Date.now() + (10 * 60 * 1000);
//         user.passwordResetCodeVerify = false;
//         if (user.image && user.image.startsWith(`${process.env.BASE_URL}`)) user.image = user.image.split('/').pop();
//         await user.save({validateModifiedOnly: true});
//     } catch (e) {
//         console.log(e);
//         return next(new ApiError(`${req.__('send_email')}`, 500)); // error server
//     }
//     const token = createTokens.resetToken(user._id);
//     res.status(200).json({token, success: true});
// })


verifyResetCode = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let token: string = '';
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
        token = req.headers.authorization.split(' ')[1];
    else return next(new ApiError(`${req.__('check_verify_code')}`, 403));

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET_RESET!);
    const hashedResetCode: string = crypto.createHash('sha256').update(req.body.resetCode).digest('hex');
    const user: any = await usersSchema.findOne({
        _id: decoded._id,
        passwordResetCode: hashedResetCode,
        passwordResetCodeExpires: {$gt: Date.now()}
    });
    if (!user) return next(new ApiError(`${req.__('check_code_valid')}`, 403)); // 

    user.passwordResetCodeVerify = true;
    if (user.image && user.image.startsWith(`${process.env.BASE_URL}`)) user.image = user.image.split('/').pop();
    await user.save({validateModifiedOnly: true});

    res.status(200).json({success: true});
})


resetPassword = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let token: string = '';
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
        token = req.headers.authorization.split(' ')[1];
    else return next(new ApiError(`${req.__('check_reset_code')}`, 403));

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET_RESET!);
    const user: any = await usersSchema.findOne({
        _id: decoded._id,
        passwordResetCodeVerify: true,
    });
    if (!user) return next(new ApiError(`${req.__('check_code_verify')}`, 403));

    user.password = req.body.password;  // new password
    user.passwordResetCodeExpires = undefined;
    user.passwordResetCode = undefined;
    user.passwordResetCodeVerify = undefined;
    user.passwordChangedAt = Date.now();
    if (user.image && user.image.startsWith(`${process.env.BASE_URL}`)) user.image = user.image.split('/').pop();
    await user.save({validateModifiedOnly: true});

    res.status(200).json({success: true});
})


allowedTo = (...roles: string[]) =>
    (async (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user.role)) return next(new ApiError(`${req.__('allowed_to')}`, 403));
        next();
    })

checkActive = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user.active) return next(new ApiError(`${req.__('check_active')}`, 403));
    next();
});


}
const authService = new AuthService();
export default authService;