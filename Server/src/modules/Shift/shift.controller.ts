import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { endShiftSchema, getAllShiftsSchema, startShiftSchema } from "./shift.validation";
import { shiftService } from "./shift.service";
import { params } from "../../utils/general";

const startShift = async (req: AuthRequest, res: Response) => {
    const cashierId = req?.user?.userId as string;
    const data = startShiftSchema.parse(req.body);
    
    const startedShift = await shiftService.startShift({ ...data, cashierId });
    
    res.status(201).json({
        success: true,
        message: 'Shift started successfully',
        data: startedShift
    });
}

const endShift = async (req: AuthRequest, res: Response) => {
    const cashierId = req?.user?.userId as string;
    const data = endShiftSchema.parse(req.body);
    
    const endedShift = await shiftService.endShift({ ...data, cashierId });
    
    res.status(200).json({
        success: true,
        message: 'Shift ended successfully',
        data: endedShift
    });
}

const getAllShifts = async (req: AuthRequest, res: Response) => {
    const query = getAllShiftsSchema.parse(req.query);
    
    const allShifts = await shiftService.findAllShifts(query);
    
    res.status(200).json({
        success: true,
        message: 'Shifts fetched successfully',
        data: allShifts
    });
}

const getShiftById = async (req: AuthRequest, res: Response) => {
    const { id: shiftId } = params.parse(req.params);
    
    const shift = await shiftService.isShiftExist(shiftId);
    
    res.status(200).json({
        success: true,
        message: 'Shift fetched successfully',
        data: shift
    });
}

export const shiftCtrl = {
    startShift,
    endShift,
    getAllShifts,
    getShiftById
}

