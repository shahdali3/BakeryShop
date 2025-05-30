import { AuthRequest } from "../../middleware/auth.middleware";
import {
  addMealToOrderSchema,
  createOrderSchema,
  deleteMealFromOrderSchema,
  getAllOrdersSchema,
  getOrderByCodeSchema,
} from "./order.validation";
import { orderService } from "./order.service";
import { params } from "../../utils/general";
import expressAsyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import ApiError from "../../utils/apiErrors";

const createOrder = async (req: AuthRequest, res: Response) => {
  const cashierId = req?.user?.userId as string;
  const shiftId = req?.user?.shiftId as string;

  const data = createOrderSchema.parse(req.body);

  const order = await orderService.createOrder({ ...data, shiftId, cashierId });

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: order
  });
};

const addMealToOrder = async (req: AuthRequest, res: Response) => {
  const { id: orderId } = params.parse(req.params);
  const { mealId, quantity } = addMealToOrderSchema.parse(req.body);

  const validatedQuantity = Number(quantity);

  const order = await orderService.addMealToOrder({ orderId, orderItem: { mealId, quantity: validatedQuantity } });

  res.status(200).json({
    success: true,
    message: 'Meal added to order successfully',
    data: order
  });
};

const deleteMealFromOrder = async (req: AuthRequest, res: Response) => {
  const { id: orderId } = params.parse(req.params);
  const { mealId } = deleteMealFromOrderSchema.parse(req.body);

  const order = await orderService.deleteMealFromOrder({ orderId, mealId });

  res.status(200).json({
    success: true,
    message: 'Meal deleted from order successfully',
    data: order
  });
};

const getAllOrders = async (req: AuthRequest, res: Response) => {
  const { page, size, date, cashierId, shiftId } = getAllOrdersSchema.parse(req.query);

  const allOrders = await orderService.getAllOrders({ page, size, date, cashierId, shiftId });

  res.status(201).json({
    success: true,
    message: 'Orders fetched successfully',
    data: allOrders
  });
};

const cancelOrder = async (req: AuthRequest, res: Response) => {
  const { id: orderId } = params.parse(req.params);

  const order = await orderService.cancelOrder(orderId);

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: order
  });
};




// const completeOrder = 
//   async (req: Request, res: Response ,next : NextFunction) => {

//     const order = await orderService.completeOrder(req.params.id);
//     if(!order) {
//       return next(new ApiError(`${req.__('not_found')}`,404));
//     }
//     res.status(200).json({
//       success: true,
//       message: 'Order completed successfully',
//       data: order
//     });
    
//   }




const getOrderByCode = async (req: AuthRequest, res: Response) => {
  const { orderCode } = getOrderByCodeSchema.parse(req.params);

  const order = await orderService.getOrderByCode(orderCode);

  res.status(200).json({
    success: true,
    message: 'Order fetched successfully',
    data: order
  });
};

const getOrderById = async (req: AuthRequest, res: Response) => {
  const { id: orderId } = params.parse(req.params);

  const order = await orderService.getOrderById(orderId);

  res.status(200).json({
    success: true,
    message: 'Order fetched successfully',
    data: order
  });
};

export const orderCtrl = {
  createOrder,
  addMealToOrder,
  deleteMealFromOrder,
  getAllOrders,
  cancelOrder,
  getOrderByCode,
  getOrderById
};
