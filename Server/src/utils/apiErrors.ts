class ApiError extends Error {

    private status : string;
    // private isOperational : boolean;
    

    constructor(message : string , private statusCode : number) {

        super(message); 
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        // this.isOperational = true;

    };
}

export default ApiError;