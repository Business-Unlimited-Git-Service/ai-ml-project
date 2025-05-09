import { Request, RequestHandler } from 'express';


interface ServerError {
    log: string;
    status: number;
    message: { err: string };
}

export const parseUserQuery: RequestHandler = async ( 
    req: Request<unknown, unknown, Record<string, unknown>>,
    res, 
    next
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
