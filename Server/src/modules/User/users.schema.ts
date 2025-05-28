import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { ShiftsDaysEnum, UserRoles, Users } from "./users.interface";

const usersSchema = new mongoose.Schema<Users>({
    name : {type : String , required : true},
    username : {type : String,required : true,unique : true},
    password : { type : String, required : true},
    role : {type : String,trim : true,enum : Object.values(UserRoles), required: true },
    active : {type : Boolean,trim : true,default : true},
    hasPassword : { type : Boolean,trim : true,default : true},
    passwordChangedAt : { type : Date,trim : true},
    passwordResetCode : {type : String, trim : true},
    passwordResetCodeExpires : { type : Date,trim : true},
    passwordResetCodeVerified : {type : Boolean,trim : true},

    // shiftStartTime: { type: String },
    // shiftEndTime: { type: String },
    // shiftDays: [
    //   { type: String, enum: Object.values(ShiftsDaysEnum) }
    // ],

    image :  {
        url: {type : String, default : 'user-default.png'},
        publicId : {type : String, default : ''}
     }

}, {timestamps : true})

    // Format image URL
const imagesUrl = (document: Users) => {
    if (
      document.image &&
      typeof document.image === 'object' &&
      'url' in document.image &&
      typeof document.image.url === 'string' &&
      document.image.url.startsWith('user')
    ) {
      document.image.url = `${process.env.BASE_URL}/images/user/${document.image.url}`
    }
  };

usersSchema
.post('init',imagesUrl)
.post('save',imagesUrl)

usersSchema.pre<Users>('save', async function(next) {

    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password , 13)
    next();
})

export default mongoose.model<Users>('User', usersSchema);

