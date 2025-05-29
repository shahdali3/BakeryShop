import { body, param } from "express-validator";
import validatorMiddleware from "../../middleware/validator.middleware";
import usersSchema from "./users.schema";


class UsersValidation {

    createOne = [
        body('username').notEmpty().withMessage((val, {req}) => req.__('validation_field'))
        .isLength({min : 2, max : 50}).withMessage((val,{req}) => req.__('validation_length_short'))
        .custom(async( val: string, {req}) => {

        const user = await usersSchema.findOne({username : val});
        if(user) throw new Error(`${req.__('validation_email_check')}`);
        return true;
    }),

    body('email').notEmpty().withMessage((val, {req}) => req.__('validation_field'))
    .isEmail().withMessage((val, {req}) => req.__('validation_value'))
    .custom(async( val: string, {req}) => {

        const user = await usersSchema.findOne({email : val});
        if(user) throw new Error(`${req.__('validation_email_check')}`);
        return true;
    }),
    body('name').notEmpty().withMessage((val, {req}) => req.__('validation_field'))
    .isLength({min : 2, max : 50}).withMessage((val,{req}) => req.__('validation_length_short')),

    body('password').notEmpty().withMessage((val, {req}) => req.__('validation_field'))
    .isLength({min : 6, max : 20}).withMessage((val,{req}) => req.__('validation_length_password')),

    body('role').notEmpty().withMessage((val, {req}) => req.__('validation_field'))

    // body('confirmPassword')
    // .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
    // .isLength({min : 6, max : 20}).withMessage((val,{req}) => req.__('validation_length_password'))
    // .custom(async( val: string, {req}) => {
        
    //     if(val !==  req.body.password) throw new Error(`${req.__('validation_password_match')}`);
    //     return true;
    // })
   

    , validatorMiddleware ]

    updateOne =  [
        param('id').isMongoId().withMessage((val, {req}) => req.__('invalid_id')),

        body('name').optional()
        .isLength({min : 2, max : 50}).withMessage((val,{req}) => req.__('validation_length_short')),

      validatorMiddleware ]


      changePassword =  [
        param('id').isMongoId().withMessage((val, {req}) => req.__('invalid_id')),

        body('password')
        .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
        .isLength({min : 6, max : 20}).withMessage((val,{req}) => req.__('validation_length_password')),

    body('confirmPassword')
    .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
    .isLength({min : 6, max : 20}).withMessage((val,{req}) => req.__('validation_length_password'))
    .custom(async( val: string, {req}) => {
        
        if(val !==  req.body.password) throw new Error(`${req.__('validation_password_match')}`);
        return true;
    }),
      validatorMiddleware ]

    getOne = [
        param('id').isMongoId().withMessage((val, {req}) => req.__('invalid_id')),
        validatorMiddleware]

    deleteOne =  [
        param('id').isMongoId().withMessage((val, {req}) => req.__('invalid_id')),
   validatorMiddleware ]
}

const usersValidation = new UsersValidation();

export default usersValidation;