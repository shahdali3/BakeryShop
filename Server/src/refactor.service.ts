import {Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import mongoose from "mongoose";
import ApiError from "./utils/apiErrors";
import Features from "./utils/features";
import sanitization from "./utils/sanitization";

class RefactorService {

   getAll = <modelType>  (model: mongoose.Model<any>,modelName ?: string ) => 
   
   expressAsyncHandler (async (req : Request, res : Response , next : NextFunction) : Promise <void> => {


      let filterData : any = {};
      if (req.filterData)  filterData = req.filterData
      const documentCount =  await model.find(filterData).countDocuments();
      const features = new Features(model.find(filterData), req.query).sort().limitFields().search(modelName!).pagination(documentCount).filter();
      const {mongoQuery, paginationResult} = features;
        const documents : modelType[] = await mongoQuery;
        res.status(200).json({message: "All documents fetched successfully" , pagination: paginationResult,countOfDocuments: documents.length, documents});
    })

    getOneById  = <modelType>  (model: mongoose.Model<any>,modelName ?: string ,populationOptions ?: string) => 
    expressAsyncHandler(async (req : Request, res : Response , next : NextFunction) : Promise <void> => {

        let query : any  = model.findById(req.params.id); // Built 
        if(populationOptions) query = query.populate(populationOptions);
        let document : any | null = await query; // async
        if(!document)   return next(new ApiError(`${req.__('not_found')}`,404));
        if(modelName === 'Users') document = sanitization.User(document);
        res.status(200).json({data: document});
    })
 
    createOne = <modelType>  (model: mongoose.Model<any> ) => 

      expressAsyncHandler(  async  (req : Request, res : Response , next : NextFunction)  : Promise <void>  =>{

        const document : modelType = await model.create(req.body);
        if(!document) {
            return next(new ApiError(`${req.__('not_found')}`,404));
        }
        res.status(201).json({message: "Document created successfully", document});
    })

    updateOne = <modelType>  (model: mongoose.Model<any> ) =>

      expressAsyncHandler( async (req : Request, res : Response , next : NextFunction) : Promise <void> => {
        
        const document : modelType| null = await model.findOneAndUpdate({_id : req.params.id}, req.body ,{new : true})
        if(!document)  return next(new ApiError(`${req.__('not_found')}`,404));

        res.status(200).json({message : "Document updated successfully", document});
    })

    deleteOne = <modelType>  (model: mongoose.Model<any> ) =>

    expressAsyncHandler (async (req : Request, res : Response , next : NextFunction) : Promise <void> => {
        
        const document : modelType | null = await model.findByIdAndDelete(req.params.id);
        if(!document){
            return next(new ApiError(`${req.__('not_found')}`,404));
        }
        res.status(200).json({message : "Document deleted successfully", document});
    })

}

const refactorService = new RefactorService();

export default refactorService;