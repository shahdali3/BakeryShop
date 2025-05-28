import { Router } from "express";
import { UserRoles } from "../User/users.interface";
import { isAuthenticated } from "../../middleware/auth.middleware";
import { paymentCtrl } from "./payment.controller";
import asyncHandler from "express-async-handler";

const router = Router();

router
    .route('/')
    .post( 
        isAuthenticated([UserRoles.CASHIER]),
        asyncHandler(paymentCtrl.createPayment)
    )
    .get(
        isAuthenticated([UserRoles.MANAGER]),
        asyncHandler(paymentCtrl.getAllPayments)
    );

router
    .route('/:id')
    .get(
        isAuthenticated([UserRoles.MANAGER]),
        asyncHandler(paymentCtrl.getPaymentById)
    );
export const paymentRouter = router;