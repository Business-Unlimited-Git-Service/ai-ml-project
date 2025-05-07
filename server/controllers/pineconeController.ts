import { RequestHandler } from 'express';
import { Pinecone, ScoredPineconeRecord } from '@pinecone-database/pinecone';
import dotenv from 'dotenv/config';



const pineCone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
})

export const queryPineconeDataBase: RequestHandler = async (_req, res, next) =>{
    const {embedding} = res.locals;

    try{
        cos
    }

    catch(err){
        next({err:'problem in pineConeController'})
    }
    
}