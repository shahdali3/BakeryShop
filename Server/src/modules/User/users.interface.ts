import { Document , Schema } from "mongoose";

export interface Users extends Document{
     username : string;
    name : string;
    password: string;
     role : UserRoles;
     active : boolean;
    hasPassword: boolean;
    
    passwordChangedAt : Date | number;
    passwordResetCode: string | undefined;
    passwordResetCodeExpires: Date | number | undefined;
    passwordResetCodeVerified: boolean | undefined ;
    image:  ImageType | string;
    
    // Shift related fields for cashiers
    // shiftStartTime?: string; // Format: "HH:mm"
    // shiftEndTime?: string;   // Format: "HH:mm"
    // shiftDays?: ShiftsDaysEnum[];
}

export interface ImageType{
    url: string;
    publicId: string;
}

export enum UserRoles  {
    ADMIN = 'admin',
    CASHIER = 'cashier',
    MANAGER = 'manager',
}

export enum ShiftsDaysEnum {
    SATURDAY = 'saturday',
    SUNDAY = 'sunday',
    MONDAY = 'monday',
    TUESDAY = 'tuesday',
    WEDNESDAY = 'wednesday',
    THURSDAY = 'thursday',
    FRIDAY = 'friday',
}