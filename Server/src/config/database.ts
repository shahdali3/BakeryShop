import mongoose from "mongoose";

const dbConnection: () => void = () : void  =>{

     mongoose.connect(process.env.DB!)
    .then(() : void => {
        console.log("DB connected successfully")
    })
    .catch((err : any) : void=> {

        console.log("Error connecting to DB", err)
    } )
}

export default dbConnection;