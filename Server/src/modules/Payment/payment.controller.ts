import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { createPaymentSchema, getAllPaymentsSchema } from "./payment.validation";
import { paymentService } from "./payment.service";
import { params } from "../../utils/general";

const createPayment = async (req: AuthRequest, res: Response) => {
    const cashierId = req?.user?.userId as string;
    const shiftId = req?.user?.shiftId as string;
    const data = createPaymentSchema.parse(req.body);
    
    const payment = await paymentService.createPayment({ ...data, shiftId, cashierId });
    
    res.status(201).json({
        success: true,
        message: 'Payment created successfully',
        data: payment
    });
}

const getAllPayments = async (req: AuthRequest, res: Response) => {
    const query = getAllPaymentsSchema.parse(req.query);
    
    const allPayments = await paymentService.getAllPayments(query);
    
    res.status(200).json({
        success: true,
        message: 'Payments fetched successfully',
        data: allPayments
    });
}

const getPaymentById = async (req: AuthRequest, res: Response) => {
    const { id: paymentId } = params.parse(req.params);
    
    const payment = await paymentService.getPaymentById(paymentId);

    res.status(200).json({
        success: true,
        message: 'Payment fetched successfully',
        data: payment
    });
}

export const paymentCtrl = {
    createPayment,
    getAllPayments,
    getPaymentById
}

