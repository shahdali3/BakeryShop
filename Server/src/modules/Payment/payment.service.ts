import ApiError from "../../utils/apiErrors";
import { pagenation } from "../../utils/pagination";
import { orderService } from "../Order";
import { shiftRepository } from "../Shift/shift.repository";
import { paymentRepository } from "./payment.repository";
import { ICreatePayment, PaymentMethod } from "./payment.types";

class PaymentService {
  constructor(private readonly paymentDataSource = paymentRepository) {}

  async createPayment(data: ICreatePayment) {
    try {
      const { orderId, discount, paymentMethods, tax, shiftId } = data;

      // check if order exists and avalible
      const order = await orderService.isOrderExist(orderId);
      if (!order) {
        throw new ApiError("Order not found", 404);
      }
      if (order.isCancelled) {
        throw new ApiError("Order is cancelled", 400);
      }
      if (order.isPaid) {
        throw new ApiError("Order is already paid", 400);
      }

      // check if discount is valid
      const orderTotalAmount = order.totalPrice;
      let expectedValue = orderTotalAmount;
      const totalAmount = paymentMethods.reduce(
        (acc, curr) => acc + curr.amount,
        0
      );
      if (tax) {
        expectedValue += (orderTotalAmount * tax) / 100;
      }
      if (discount) {
        expectedValue -= (orderTotalAmount * discount) / 100;
      }

      // check if total amount is correct
      if (expectedValue != totalAmount) {
        throw new ApiError(
          "The amount paid is not enough for the order value",
          400
        );
      }

      const payment = await this.paymentDataSource.createOne({
        ...data,
        totalAmount,
      });

      // update order data => isPaid
      await orderService.updateOrder({ orderId, data: { isPaid: true } });

      // update shift data => notPaidOrders -1, balance cash/visa
      let paymentWithCash = 0;
      let paymentWithVisa = 0;
      for (const { amount, method } of paymentMethods) {
        if (method === PaymentMethod.VISA) {
          paymentWithVisa += amount;
        }
        if (method === PaymentMethod.CASH) {
          paymentWithCash += amount;
        }
      }
      await shiftRepository.updateOne(
        { _id: shiftId },
        {
          $inc: {
            notPaidOrdersCount: -1,
            paymentWithCashBalance: paymentWithCash,
            paymentWithVisaBalance: paymentWithVisa,
          },
        }
      );

      await orderService.markOrderAsPaid(orderId);

      // Print reset for payment

      return payment;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Failed to create payment", 500);
    }
  }

  async getAllPayments({
    page,
    size,
    paymentMethod,
    date,
    shiftId,
    cashierId,
    search,
  }: {
    page: number;
    size: number;
    paymentMethod?: PaymentMethod;
    date?: Date;
    cashierId?: string;
    shiftId?: string;
    search?: string;
  }) {
    try {
      let query: any = {};
      if (paymentMethod) {
        query.paymentMethods = { $elemMatch: { method: paymentMethod } };
      }
      if (shiftId) {
        query.shiftId = shiftId;
      }
      if (cashierId) {
        query.cashierId = cashierId;
      }
      if (date) {
        query.createdAt = { $gte: date };
      }

      // Handle search by order code
      let orderQuery: any = {};
      if (search) {
        orderQuery.orderCode = { $regex: search, $options: "i" };
      }

      const { skip, limit } = pagenation({ page, size });

      // Get total count for pagination
      const totalCount = await this.paymentDataSource.countDocuments(
        query,
        orderQuery
      );

      // Get payments with pagination
      const payments = await this.paymentDataSource.findMany(
        query,
        { skip, limit },
        orderQuery
      );

      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: payments,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          pageSize: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      console.log(error);
      if (error instanceof ApiError) throw error;
      throw new ApiError("Failed to get all payments", 500);
    }
  }

  async getPaymentById(paymentId: string) {
    try {
      const payment = await this.paymentDataSource.findOne({ _id: paymentId });
      return payment;
    } catch (error) {
      throw new ApiError("Failed to get payment by id", 500);
    }
  }
}

export const paymentService = new PaymentService();
