import { FilterQuery, Model, UpdateQuery } from "mongoose";
import { Payment } from "./payment.schema";
import { IPayment } from "./payment.types";

class OrderRepository<T = IPayment> {
  constructor(private orderModel: Model<T>) {}

  async createOne(data: Partial<T>): Promise<T | null> {
    const payment = await this.orderModel.create(data);
    return await this.findOne({ _id: payment._id });
  }

  async updateOne(
    query: FilterQuery<T>,
    data: UpdateQuery<T>
  ): Promise<T | null> {
    return this.orderModel
      .findByIdAndUpdate(query, data, { new: true })
      .populate([{ path: "orderData" }, { path: "cashierData" }]);
  }

  async findOne(query: FilterQuery<T>): Promise<T | null> {
    return this.orderModel
      .findById(query)
      .populate([{ path: "orderData" }, { path: "cashierData" }]);
  }

  async findMany(
    query: FilterQuery<T>,
    { limit, skip }: { limit: number; skip: number },
    orderQuery?: any
  ): Promise<T[]> {
    let aggregationPipeline: any[] = [
      { $match: query },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "orderData",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "cashierId",
          foreignField: "_id",
          as: "cashierData",
        },
      },
      {
        $addFields: {
          orderData: { $arrayElemAt: ["$orderData", 0] },
          cashierData: { $arrayElemAt: ["$cashierData", 0] },
        },
      },
    ];

    // Add order search if provided
    if (orderQuery && Object.keys(orderQuery).length > 0) {
      aggregationPipeline.push({
        $match: {
          "orderData.orderCode": orderQuery.orderCode,
        },
      });
    }

    // Add pagination
    aggregationPipeline.push({ $skip: skip }, { $limit: limit });

    return this.orderModel.aggregate(aggregationPipeline);
  }

  async countDocuments(
    query: FilterQuery<T>,
    orderQuery?: any
  ): Promise<number> {
    let aggregationPipeline: any[] = [
      { $match: query },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "orderData",
        },
      },
      // Flatten the orderData array
      {
        $addFields: {
          orderData: { $arrayElemAt: ["$orderData", 0] },
        },
      },
    ];

    // Add order search if provided
    if (orderQuery && Object.keys(orderQuery).length > 0) {
      aggregationPipeline.push({
        $match: {
          "orderData.orderCode": orderQuery.orderCode,
        },
      });
    }

    // Count documents
    aggregationPipeline.push({ $count: "total" });

    const result = await this.orderModel.aggregate(aggregationPipeline);
    return result.length > 0 ? result[0].total : 0;
  }

  async deleteOne(query: FilterQuery<T>): Promise<boolean> {
    const result = await this.orderModel.deleteOne(query);
    return result.deletedCount > 0;
  }
}

export const paymentRepository = new OrderRepository(Payment);
