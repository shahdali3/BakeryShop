

import { Document } from "mongoose";

export interface Meal extends Document {
    name : string;
    image : ImageType | string;
    categoryId : string;
    notes : string ;
    ingredients : Ingredient[]; 
    price : number;
    isAvailable : boolean;
}

export interface Ingredient {
    stockItemId : string;
    quantityUsed : number;
    unit : Unit;
}

export interface ImageType {
    url: string;
    publicId: string;
}

// type Category = 'breakfast' | 'lunch' | 'dinner' | 'drinks' | 'desserts' | 'juices';

type Unit = 'pcs'|'ml'|'grams'|'kg'|'liters'|'cans'|'cups'|'tsp'|'tbsp'|'packets'|'boxes' ; // tsp = teaspoon للتوابل



