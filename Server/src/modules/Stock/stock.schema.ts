import mongoose from "mongoose";



const stockSchema = new mongoose.Schema({

    name: {
        type : String,
        required : true,
        unique : true
    },
    quantity : {
        type: Number,
        required : true,
        default : 0
    },
    pricePerUnit : {
        type : Number,
        required : true
    },
    category: {
        type : String,
        enum : ['breakfast', 'lunch', 'dinner', 'drinks','snacks','others'] ,
        required : true
    },
    unit : {
        type : String,
        required : true,
        default : 'pcs'
    },
    managerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Users',
        required : true
    },
    date : {
        type : Date,
        default : Date.now
    }

},{timestamps : true})

export default mongoose.model('Stock',stockSchema);