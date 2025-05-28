import Meal from "../Meal/meal.schema";
import ApiError from "../../utils/apiErrors";
import { pagenation } from "../../utils/pagination";
import { orderRepository } from "./order.repository";
import { ICreateOrderData, ICreateOrderQuery, IOrder, IOrderMealItem } from "./order.types";
import { FilterQuery } from "mongoose";
import { Order } from "./order.schema";
import stockOutflowSchema from "../StockOutflow/stockOutflow.schema";
import stockSchema from "../Stock/stock.schema";
import { shiftService } from "../Shift/shift.service";
import { shiftRepository } from "../Shift/shift.repository";

class OrderService {

    constructor(private readonly orderdDataSource = orderRepository) {}

    async isOrderExist(orderId: string) {
        const order = await this.orderdDataSource.findOne({ _id : orderId});
        if (!order) {
            throw new ApiError('الطلب غير موجود', 404);
        }
        return order;
    }

    async findOrderById(orderId: string) {
        return this.orderdDataSource.findOne({ _id : orderId});
    }

    async updateOrder({ orderId, data }: { orderId: string, data: Partial<IOrder> }) {
        const updatedOrder = await this.orderdDataSource.updateOne({_id : orderId}, data);
        if (!updatedOrder) {
            throw new ApiError('Failed to update order', 500);
        }
        return updatedOrder;
    }

    async createOrder(data: ICreateOrderQuery) {
        try {
            const { orderItems, cashierId, type, custName, custPhone, custAddress, shiftId } = data;

            let orderObject: ICreateOrderData = {} as ICreateOrderData;
            
            //! Check is all meal availbale
            let totalPrice = 0;
            const newOrderItems: IOrderMealItem[] = [];
            let allItemsCount = 0;
            for(const item of orderItems) {
                const meal = await Meal.findById(item.mealId);
                allItemsCount += item.quantity
                if (!meal || !meal?.isAvailable) {
                    throw new ApiError('Meal not available now', 404);
                }
                
                // console.log(meal)
                // console.log(meal.departmentId)

                const mealObj = meal.toObject();
                console.log(mealObj)

                totalPrice += meal.price * item.quantity;
                newOrderItems.push({
                    mealId: item.mealId,
                    quantity: item.quantity,
                    price: mealObj.price,
                    isCancelled: false,
                    note: item?.note || ""
                });
            }
            orderObject.orderItems = newOrderItems;
            orderObject.totalPrice = totalPrice;
            orderObject.type = type;
            if(custName) orderObject.custName = custName;
            if(custPhone) orderObject.custPhone = custPhone;
            if(custAddress) orderObject.custAddress = custAddress;
            if(shiftId) orderObject.shiftId = shiftId;
            if(cashierId) orderObject.cashierId = cashierId;
            
            const order = await this.orderdDataSource.createOne(orderObject);

            // update shift data
            await shiftRepository.updateOne(
                { _id: shiftId },
                { $inc: { allOrdersCount: 1, notPaidOrdersCount: 1, soldItemsCount: allItemsCount } }
            );
            
            return order;
        } catch (error) {
            console.log(error);
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('Failed to create order', 500);
        }
    }
      
    async addMealToOrder({ orderId, orderItem }: { orderId: string, orderItem: { mealId: string, quantity: number, note?: string } }) {
        try {
            let { orderItems, totalPrice } = await this.isOrderExist(orderId);
            
            const meal = await Meal.findById(orderItem.mealId);
            if (!meal || !meal?.isAvailable) {
                throw new ApiError('Meal not available now', 404);
            }

            const mealObj = meal.toObject();
            console.log(mealObj)

            //! Update order items if meal is already in order
            orderItems = orderItems.filter(item => item.mealId.toString() !== orderItem.mealId.toString());
            orderItems.push({
                mealId: orderItem.mealId,
                quantity: orderItem.quantity,
                price: meal.price,
                isCancelled: false,
                note: orderItem?.note || ""
            });
            
            totalPrice = orderItems.reduce(
                (acc, item) => acc + (item.isCancelled ? 0 : item.price * item.quantity), 0
            );
           
            const updatedOrder = await this.orderdDataSource.updateOne(
                { _id: orderId }, 
                { totalPrice, orderItems }) as IOrder;
            
            // update shift data
            await shiftRepository.updateOne(
                { _id: updatedOrder?.shiftId },
                { $inc: { soldItemsCount: orderItem.quantity } }
            );

            return updatedOrder;
        } catch (error) {
            console.log(error)
            if(error instanceof ApiError) throw error
            throw new ApiError('Failed to add meal to order', 500);
        }
    }

    async deleteMealFromOrder({ orderId, mealId: mealIdData }: { orderId: string, mealId: string }) {
        try {
            const order = await this.isOrderExist(orderId);
            
            // Update the orderItems array directly
            const orderItems = order.orderItems.map(item => {
                // console.log(item.mealId.toString(), mealIdData)
                const { isCancelled, mealId, price, quantity, note } = item;
                return item.mealId.toString() === mealIdData.toString() 
                    ? { 
                        mealId, price, quantity, note,
                        isCancelled: true 
                    }
                    : {
                        isCancelled, mealId, price, quantity, note
                    }
            });

            // console.log(orderItems);

            const totalPrice = orderItems.reduce(
                (acc, item) => acc + (item.isCancelled ? 0 : item.price * item.quantity), 0
            );

            const updatedOrder = await this.orderdDataSource.updateOne(
                { _id: orderId },
                { $set: { orderItems, totalPrice } }
            );
            
            if (!updatedOrder) {
                throw new ApiError('Failed to update order', 500);
            }
            
            return updatedOrder;
        } catch (error) {
            if(error instanceof ApiError) throw error
            throw new ApiError('Failed to delete meal from order', 500);
        }
    }

    async deleteOrder(orderId: string) {
        try {
            await this.isOrderExist(orderId);
            const result = await this.orderdDataSource.deleteOne({_id : orderId});
            if(!result) throw new ApiError('Failed to delete order', 500);
            return result;
        } catch (error) {
            if(error instanceof ApiError) throw error
            throw new ApiError('Failed to delete order', 500);
        }
    }

    async getAllOrders({ page, size, date, cashierId, shiftId }: { page: number, size: number, date?: Date, cashierId?: string, shiftId?: string }) {
        try {
            const query: any = {};
            if (date) {
                query.createdAt = { $gte: date };
            }
            if (cashierId) {
                query.cashierId = cashierId;
            }
            if (shiftId) {
                query.shiftId = shiftId;
            }
            console.log(query);
            const { limit, skip } = pagenation({ page, size });
            return this.orderdDataSource.findMany(query, { limit, skip });       
        } catch (error) {
            if(error instanceof ApiError) throw error
            throw new ApiError('failed to get orders', 500);
        }
    }

    async findOne(query: FilterQuery<IOrder>) {
        const order = await this.orderdDataSource.findOne(query);
        if(!order) {
            throw new ApiError('الطلب غير موجود', 404)
        }
        return order;
    }
    
    async getOrderByCode(orderCode: string) {
        return await this.findOne({ orderCode })
    }

    async getOrderById(orderId: string) {
        return await this.findOne({ _id: orderId })  
    }

    async cancelOrder(orderId: string) {
        try {
            const order = await this.isOrderExist(orderId);
            if(order.isCancelled) {
                throw new ApiError('Order is already cancelled', 400);
            }
            
            const cancelledOrder = await this.orderdDataSource.updateOne({ _id: orderId }, { isCancelled: true });


            return cancelledOrder
        } catch (error) {
            if(error instanceof ApiError) throw error
            throw new ApiError('Failed to cancel order', 500);
        }
    }

    async completeOrder(orderId: string): Promise<IOrder> {
        // 1. الحصول على الطلب مع الوجبات
        const order = await Order.findById(orderId)
          .populate({
            path: 'orderItems.mealId',
            populate: { path: 'ingredients.stockItemId' }
          });
        
        if (!order) {
          throw new ApiError('Order not found', 404);
        }
    
        // 2. التحقق من توفر المخزون
        await this.verifyStockAvailability(order);
    
        // 3. خصم المخزون وتسجيل التدفقات
        await this.deductStockAndRecordOutflows(order);
    
        // // 4. تحديث حالة الطلب
        // order.status = OrderStatus.COMPLETED;
        return await order.save();

    ;
    }
    
      private async verifyStockAvailability(order: IOrder): Promise<void> {
        const insufficientItems: string[] = [];
    
        for (const item of order.orderItems) {
          const meal = item.mealId as any;
          
          for (const ingredient of meal.ingredients) {
            const stock = await stockSchema.findById(ingredient.stockItemId);
            const requiredQuantity = ingredient.quantityUsed * item.quantity;
    
            if (!stock || stock.quantity < requiredQuantity) {
              insufficientItems.push(
                `${meal.name} - ${stock?.name || 'Unknown'} (Needed: ${requiredQuantity}, Available: ${stock?.quantity || 0})`
              );
            }
          }
        }
    
        if (insufficientItems.length > 0) {
          throw new ApiError(`Insufficient stock for: ${insufficientItems.join(', ')}`, 400);
        }
      }
    
      private async deductStockAndRecordOutflows(order: IOrder): Promise<void> {
        for (const item of order.orderItems) {
          const meal = item.mealId as any;
    
          for (const ingredient of meal.ingredients) {
            const quantityUsed = ingredient.quantityUsed * item.quantity;
    
            // خصم من المخزون
            await stockSchema.findByIdAndUpdate(
              ingredient.stockItemId,
              { $inc: { quantity: -quantityUsed } }
            );
    
            // تسجيل تدفق المخزون
            await stockOutflowSchema.create({
              stockItemId: ingredient.stockItemId,
              orderId: order._id,
              quantityUsed,
              date: new Date()
            });
          }
        }
      }


}


    /////////////////////////////////////////////////////////////

 //   3. handleStockOutflowForOrder (مع rollback في حالة الخطأ)

//  async handleStockOutflowForOrder(order: IOrder) {
//     const revertedStockItems: { stock: any; quantityToRevert: number }[] = [];

//     try {
//         for (const item of order.orderItems) {
//             const meal = await Meal.findById(item.mealId);
//             if (!meal) continue;

//             const ingredients = JSON.parse(meal.ingredients) as {
//                 stockItemId: string;
//                 quantityUsed: number;
//             }[];

//             for (const ingredient of ingredients) {
//                 const usedQty = ingredient.quantityUsed * item.quantity;
//                 const stockItem = await stockSchema.findById(ingredient.stockItemId);
//                 if (!stockItem) continue;

//                 if (stockItem.quantity < usedQty) {
//                     throw new ApiError(`Insufficient stock for ${stockItem.nameOfItem}`, 400);
//                 }

//                 stockItem.quantity -= usedQty;
//                 await stockItem.save();

//                 revertedStockItems.push({
//                     stock: stockItem,
//                     quantityToRevert: usedQty
//                 });

//                 await stockOutflowSchema.create({
//                     stockItemId: stockItem._id,
//                     orderId: order._id,
//                     quantityUsed: usedQty,
//                     date: new Date()
//                 });
//             }
//         }
//     } catch (err) {
//         for (const { stock, quantityToRevert } of revertedStockItems) {
//             stock.quantity += quantityToRevert;
//             await stock.save();
//         }

//         throw new ApiError('Failed to deduct stock. Rollback applied.', 500);
//     }
// }



export const orderService = new OrderService() 
