import mongoose from "mongoose";

class  Features {

    // keys : sort, fields, search, page, limit 

    public paginationResult : any ;

    constructor(public mongoQuery: mongoose.Query<any[],any>,private queryString: any) {}

    filter()  {

        const queryStringObj : any = {...this.queryString};
        const executedFields : string[] = ['page', 'sort', 'limit', 'fields', 'search','lang']

        executedFields.forEach( (key : string) => {

            delete queryStringObj[key]; // object
        })

        let queryStr:string = JSON.stringify(queryStringObj); 

        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`); 
        this.mongoQuery = this.mongoQuery.find(JSON.parse(queryStr));  // parse transform string to object(json)
        return this;


    }
    sort() {
        if(this.queryString.sort)  {
            console.log(this.queryString.sort);


            const sortBy = this.queryString.sort.split(',').join(' ');
            this.mongoQuery = this.mongoQuery.sort(sortBy);
        }else

             this.mongoQuery.sort('-createdAt'); 
            return this;
        
    }
    limitFields()  {

        if(this.queryString.fields) {
            const field = this.queryString.fields.split(',').join(' ');
            this.mongoQuery = this.mongoQuery.select(field);
        }else 
            this.mongoQuery.select('-__v');
            return this;

    }
    search (modelName: string) {

        if(this.queryString.search){
            let query : any;
            if(modelName === 'Products') {

                query ={ $or : 
                     [
                    {name: new RegExp (this.queryString.search,  'i')},
                    {description: new RegExp (this.queryString.search,  'i')}
                ]
                }

            }else{
             query = {name: new RegExp (this.queryString.search,  'i')};
            }
            this.mongoQuery = this.mongoQuery.find(query);
        }
        return this;
    }
    pagination(documentCount: number)  {

        const page: number = this.queryString.page * 1 || 1;
        const limit: number = this.queryString.limit * 1 || 20;
        const skip: number = (page - 1) * limit;
        const endIndex : number = page * limit;
        const pagination: any = {};
        pagination.currentPage = page;
        pagination.limit = limit;
        pagination.numberOfPages = Math.ceil(documentCount / limit);

        if(endIndex < documentCount)   pagination.next = page + 1;
        if(skip > 0)  pagination.previous = page - 1;
        this.mongoQuery = this.mongoQuery.skip(skip).limit(limit);
        this.paginationResult = pagination;

        return this

    }
}

export default Features