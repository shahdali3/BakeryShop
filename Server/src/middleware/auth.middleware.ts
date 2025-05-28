import { NextFunction, Request, Response } from 'express';
import { UserRoles, ShiftsDaysEnum } from '../modules/User/users.interface';
import asyncHandler from 'express-async-handler';
import ApiError from '../utils/apiErrors';
import { verify } from 'jsonwebtoken';
import usersService from '../modules/User/users.service';
import usersSchema from '../modules/User/users.schema';
import { shiftRepository } from '../modules/Shift/shift.repository';
import { decode } from 'punycode';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: UserRoles;
    shiftId?: string
  };
}

export interface IJwtPayload {
    userId: string;
    role: UserRoles;
}

// Helper function to convert time string to minutes
const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

export const isAuthenticated = (allowedRoles: UserRoles[] = [], isShiftRequired: boolean = true) => {
    return asyncHandler(
        async (req: AuthRequest, _res: Response, next: NextFunction) => {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return next(new ApiError('Unauthorized - No Prefix Token', 401));
            }

            const token = authHeader.split(' ')[1];

            if (!token) {
                return next(new ApiError('Unauthorized - No Token', 401));
            }

            const decoded = verify(token, process.env.JWT_SECRET as string) as any;
            const user = await usersSchema.findById(decoded.userId);

            if (!user) {
                return next(new ApiError('User not found', 404));
            }

            if (!user.active) {
                return next(new ApiError('User is not active', 401));
            }

            if (allowedRoles && !allowedRoles.includes(user.role)) {
                return next(new ApiError('Unauthorized - Not have access to this', 401));
            }

            let shiftId = decoded.shiftId;
            if(user.role === UserRoles.CASHIER) {
                if(isShiftRequired) {
                    const shift =  await shiftRepository.findOne({ cashierId: user._id, isCancelled: false });
                    if(!shift) {
                        return next(new ApiError("You not have any shift ca not make this", 401))
                    }
                    shiftId =  shift._id;
                }
            }

            // if (user && user?.role === UserRoles.CASHIER) {
            //     // Get current UAE time
            //     const now = new Date();
            //     const uaeTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' }));
            //     const currentDay = uaeTime.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Dubai' }).toLowerCase() as ShiftsDaysEnum;
            //     const currentTime = uaeTime.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Dubai' }); // Get current time in 24h format
            //     const currentMinutes = timeToMinutes(currentTime);

            //     // Check if current day is in cashier's shift days
            //     if (!user.shiftDays?.includes(currentDay)) {
            //         console.log(currentDay, user?.shiftDays)
            //         return next(new ApiError('Access denied: Not your shift day', 401));
            //     }

            //     // Check if current time is within shift hours
            //     if (user.shiftStartTime && user.shiftEndTime) {
            //         const startMinutes = timeToMinutes(user.shiftStartTime);
            //         const endMinutes = timeToMinutes(user.shiftEndTime);

            //         if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
            //             return next(new ApiError('Access denied: Outside shift hours', 401));
            //         }
            //     }
            // }

            req.user = {
                userId: decoded.userId,
                role: decoded.role,
                shiftId
            };
            return next();
        },
    );
}