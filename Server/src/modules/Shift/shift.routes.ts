import { Router } from "express";
import { UserRoles } from "../User/users.interface";
import { isAuthenticated } from "../../middleware/auth.middleware";
import asyncHandler from "express-async-handler";
import { shiftCtrl } from "./shift.controller";

const router = Router();

router
    .route('/')
    .post( 
        isAuthenticated([UserRoles.CASHIER], false),
        asyncHandler(shiftCtrl.startShift)
    )
    .patch( 
        isAuthenticated([UserRoles.CASHIER]),
        asyncHandler(shiftCtrl.endShift)
    )
    .get(
        isAuthenticated([UserRoles.CASHIER, UserRoles.MANAGER]),
        asyncHandler(shiftCtrl.getAllShifts)
    );

router
    .route('/:id')
    .get(
        isAuthenticated([UserRoles.MANAGER, UserRoles.CASHIER]),
        asyncHandler(shiftCtrl.getShiftById)
    );

export const shiftRouter = router;