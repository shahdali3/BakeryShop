import { body, param } from "express-validator";
import validatorMiddleware from "../../middleware/validator.middleware";
import usersSchema from "./users.schema";
import { UserRoles, ShiftsDaysEnum } from "./users.interface";


class UsersValidation {

    createOne = [
        body('username').notEmpty().withMessage((val, {req}) => req.__('validation_field'))
        .isLength({min : 2, max : 50}).withMessage((val,{req}) => req.__('validation_length_short'))
        .custom(async( val: string, {req}) => {
            const user = await usersSchema.findOne({username : val});
            if(user) throw new Error(`${req.__('validation_email_check')}`);
            return true;
        }),

        body('name').notEmpty().withMessage((val, {req}) => req.__('validation_field'))
        .isLength({min : 2, max : 50}).withMessage((val,{req}) => req.__('validation_length_short')),

        body('password').notEmpty().withMessage((val, {req}) => req.__('validation_field'))
        .isLength({min : 6, max : 20}).withMessage((val,{req}) => req.__('validation_length_password')),

        body('role').default(UserRoles.CASHIER),

        // Cashier shift validations
        body('shiftStartTime')
        // .if(body('role').equals(UserRoles.CASHIER))
        .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage((val, {req}) => req.__('validation_time_format')),

        body('shiftEndTime')
        // .if(body('role').equals(UserRoles.CASHIER))
        .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage((val, {req}) => req.__('validation_time_format'))
        .custom((val, { req }) => {
            if (req.body.shiftStartTime && val <= req.body.shiftStartTime) {
                throw new Error(req.__('validation_shift_end_after_start'));
            }
            return true;
        }),

        body('shiftDays')
        // .if(body('role').equals(UserRoles.CASHIER))
        .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
        .isArray().withMessage((val, {req}) => req.__('validation_must_be_array'))
        .custom((val: any[]) => {
            if (!Array.isArray(val)) return false;
            const validDays = Object.values(ShiftsDaysEnum);
            return val.every(day => validDays.includes(day));
        })
        .withMessage((val, {req}) => req.__('validation_shift_day')),

        validatorMiddleware
    ]

    updateOne =  [
        param('id').isMongoId().withMessage((val, {req}) => req.__('invalid_id')),

        body('name').optional()
        .isLength({min : 2, max : 50}).withMessage((val,{req}) => req.__('validation_length_short')),

        // Cashier shift validations
        // body('shiftStartTime')
        // .optional()
        // .if(body('role').equals(UserRoles.CASHIER))
        // .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        // .withMessage((val, {req}) => req.__('validation_time_format')),

        // body('shiftEndTime')
        // .optional()
        // .if(body('role').equals(UserRoles.CASHIER))
        // .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        // .withMessage((val, {req}) => req.__('validation_time_format'))
        // .custom((val, { req }) => {
        //     if (req.body.shiftStartTime && val <= req.body.shiftStartTime) {
        //         throw new Error(req.__('validation_shift_end_after_start'));
        //     }
        //     return true;
        // }),

        // body('shiftDays')
        // .optional()
        // .if(body('role').equals(UserRoles.CASHIER))
        // .isArray().withMessage((val, {req}) => req.__('validation_must_be_array'))
        // .custom((val: any[]) => {
        //     if (!Array.isArray(val)) return false;
        //     const validDays = Object.values(ShiftsDaysEnum);
        //     return val.every(day => validDays.includes(day));
        // })
        // .withMessage((val, {req}) => req.__('validation_shift_day')),

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