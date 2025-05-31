import mongoose from "mongoose";
import { Category } from "./category.interface";





const categorySchema = new mongoose.Schema({

    name : {
        type : String,
        required : true,
        unique : true,
        trim : true
    },
   
    description : {
        type : String,
        trim : true
    },
    color: {
        type: String
    },
    date : {
        type : Date,
        default : Date.now
    }



},{timestamps : true});

export default mongoose.model<Category>('Category',categorySchema);