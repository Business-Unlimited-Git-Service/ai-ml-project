import { Request, NextFunction, RequestHandler } from 'express';
import { CustomResponse, ServerError } from '../types';


export const parseUserQuery: RequestHandler = async ( 
    req: Request,
    res: CustomResponse, 
    next: NextFunction
 ) => {
        if (!req.body.userQuery) {
        return next({
            log: 'User query not provided',
            status: 400,
            message: { err: 'An error occured in user query' },
        } as ServerError);    
    }

    const { userQuery } = req.body;
    console.log(userQuery)
    
    if(typeof userQuery !== 'string'){
        const error: ServerError ={
            log: 'UserQuery is not a string',
            status: 400,
            message: { err: 'an error occurred while parsing the user query'},
        };
        return next(error);
    }
    res.locals.userQuery = userQuery;
    return next();
}
