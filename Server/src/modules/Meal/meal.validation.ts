import { body, param } from "express-validator";
import validatorMiddleware from "../../middleware/validator.middleware";
import mealSchema from "./meal.schema";

class MealsValidation {

    createOne = [
        body('name').notEmpty().withMessage('name is required')
        .isLength({min : 3, max : 50}).withMessage('name must be at least 3 characters long')
        .custom(async( val: string, {req}) => {

        const meal = await  mealSchema.findOne({name : val});
        if(meal) throw new Error(`${req.__('not_found')}`);
        return true;
    })
    , validatorMiddleware ]

    updateOne =  [
        param('id').isMongoId().withMessage((val, {req}) => req.__('invalid_id')),
        body('name').optional()
        .isLength({min : 2, max : 50}).withMessage('name must be at least 2 characters long')
        .custom(async( val: string, {req}) => {

        const meal = await mealSchema.findOne({name : val});
        if(meal && meal._id!.toString() !== req.params?.id.toString()) throw new Error('Meal already exists');
        return true;
    }), validatorMiddleware ]

    getOne = [
        param('id').isMongoId().withMessage((val, {req}) => req.__('invalid_id')),
        validatorMiddleware]

    deleteOne =  [
        param('id').isMongoId().withMessage((val, {req}) => req.__('invalid_id')),
        validatorMiddleware 
    ]
}

const mealsValidation = new MealsValidation();

export default mealsValidation;