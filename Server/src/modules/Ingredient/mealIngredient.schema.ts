import mongoose from "mongoose";

const mealIngredientSchema =
 new mongoose.Schema({
     mealId: { 
        type: mongoose.Schema.Types.ObjectId,
         ref: 'Meal',
          required: true 
        },
         stockItemId: 
         { type: mongoose.Schema.Types.ObjectId,
             ref: 'Stock',
              required: true
             },
             quantityUsed: {
                 type: Number,
                 required: true },
     unit:
      { type: String,
         default: 'pcs' } 
        }, { timestamps: true });
        
        export const MealIngredient = mongoose.model('MealIngredient', mealIngredientSchema); 