import { Router } from "express";
import { orderCtrl } from "./odrer.controller";
import { isAuthenticated } from "../../middleware/auth.middleware";
import asyncHandler from 'express-async-handler'
import { UserRoles } from "../User/users.interface";

const router = Router();

router.route('/')
    .post(
        isAuthenticated([UserRoles.CASHIER,UserRoles.MANAGER]),
        asyncHandler(orderCtrl.createOrder)
    )
    .get(
        isAuthenticated([
            UserRoles.MANAGER, 
            UserRoles.CASHIER,
        ]),
        asyncHandler(orderCtrl.getAllOrders)
    )

router.route('/:id')
    .patch(
        isAuthenticated([UserRoles.CASHIER, UserRoles.MANAGER]),
        asyncHandler(orderCtrl.addMealToOrder)
    )
    .delete(
        isAuthenticated([UserRoles.MANAGER, UserRoles.CASHIER]),
        asyncHandler(orderCtrl.deleteMealFromOrder)
    ).get(
        isAuthenticated([UserRoles.CASHIER, UserRoles.MANAGER]),
        asyncHandler(orderCtrl.getOrderById)
    )

router.patch(
    '/:id/cancel',
    isAuthenticated([UserRoles.MANAGER, UserRoles.CASHIER]),
    asyncHandler(orderCtrl.cancelOrder)
)

router.get(
    '/get-by-code/:orderCode',
    isAuthenticated([
        UserRoles.MANAGER,
        UserRoles.CASHIER,
    ]),
    asyncHandler(orderCtrl.getOrderByCode)
)

export const orderRouter = router;


