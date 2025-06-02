

import { Document } from "mongoose";

export interface Meal extends Document {
    name : string;
    image : ImageType | string;
    categoryId : string;
    notes : string ;
    ingredients : MealIngredient[]; 
    price : number;
    isAvailable : boolean;
}

export interface MealIngredient {
    stockItemId : string;
    stockName : string;
    quantityUsed : number;
    unit : Unit;
    status : string;
}

export interface ImageType {
    url: string;
    publicId: string;
}

// type Category = 'breakfast' | 'lunch' | 'dinner' | 'drinks' | 'desserts' | 'juices';

type Unit = 'pcs'|'ml'|'grams'|'kg'|'liters'|'cans'|'cups'|'tsp'|'tbsp'|'packets'|'boxes' ; // tsp = teaspoon للتوابل



