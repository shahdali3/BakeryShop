import ApiError from "../../utils/apiErrors";
import { pagenation } from "../../utils/pagination";
import { orderRepository } from "../Order";
import { shiftRepository } from "./shift.repository";
import { IEndShift, IShift, IStartShift } from "./shift.types";


class ShiftService {

    constructor(private readonly shiftDataSource = shiftRepository){}

    async startShift(data: IStartShift) {
        try {
            const { cashierId, startBalance } = data
            
            console.log(data);

            // Check if cashier has an open shift
            const isChashierHaveAnotherShiftOpen = await this.shiftDataSource.findOne({ cashierId, isCancelled: false });
            if(isChashierHaveAnotherShiftOpen) {
                throw new ApiError('You already have running shift, cannot create another', 400)
            }

            // Initialize shift with all required fields
            const shiftData = {
                cashierId,
                startBalance,
                allOrdersCount: 0,
                notPaidOrdersCount: 0,
                paymentWithCashBalance: 0,
                paymentWithVisaBalance: 0,
                soldItemsCount: 0,
                isCancelled: false
            };

            const createdShift = await this.shiftDataSource.createOne(shiftData);
            if (!createdShift) {
                throw new ApiError('Failed to create shift', 500);
            }
            return createdShift;

        } catch(error) {
            console.log(error)
            if(error instanceof ApiError) throw error
            throw new ApiError('Start new shift failed', 500)
        }
    }

    async endShift(data: IEndShift) {
        try {
            const { cashierId, endBalance } = data
            
            const isChashierHaveShiftOpen = await this.shiftDataSource.findOne({ cashierId, isCancelled: false }) as IShift;
            if(!isChashierHaveShiftOpen) {
                throw new ApiError('You have not running shift', 400)
            }
            if(isChashierHaveShiftOpen.cashierId.toString() != cashierId) {
                throw new ApiError('You not the owner of shift, cn not end it', 400)
            }

            const areThereNotPaidOrders = await orderRepository.findMany({ shiftId: isChashierHaveShiftOpen?._id, isPaid: false }, { limit: 1, skip: 0 })
            if(areThereNotPaidOrders.length > 0) {
                throw new ApiError('Must all orders are paid or can not end this shift', 500)
            }

            const endedShift = await this.shiftDataSource.updateOne(
                { _id: isChashierHaveShiftOpen._id },
                { isCancelled: true, cancelledAt: new Date(), endBalance }
            );
            return endedShift;

        } catch(error) {
            console.log(error)
            if(error instanceof ApiError) throw error
            throw new ApiError('End exist shift failed', 500)
        }
    }

    async findAllShifts({ page, size, cashierId }: { cashierId?: string; page: number; size: number }){
        let query: any = {}
        
        if(cashierId) query.cashierId = cashierId;
        
        const { skip, limit } = pagenation({ page, size }); 
        
        return await this.shiftDataSource.findMany(query, { skip, limit });
    }

    async isShiftExist(shiftId: string) {
        const shiftIsExists = await this.shiftDataSource.findOne({ _id: shiftId });
        if(!shiftIsExists) {
            throw new ApiError('Shift not found', 404)
        } 
        return shiftIsExists
    }
}

export const shiftService = new ShiftService();