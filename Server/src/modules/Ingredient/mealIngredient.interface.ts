import { Document, Types } from "mongoose";

export interface MealIngredient extends Document {
    mealId : Types.ObjectId,
    stockItemId : Types.ObjectId,
    quantityUsed : number,
    unit : string

}