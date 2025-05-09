import { Response } from 'express';

declare namespace NodeJS {
    interface ProcessEnv {
      OPENAI_KEY: string;
      PINECONE_API_KEY: string;
    }
  }

export interface CustomLocals {
  embedding?: number[];
  newPokemon?: string;
  userQuery?: string;
  pineconeQueryResult?: string;
}

export interface ServerError {
    log: string;
    status: number;
    message: { err: string };
}

export interface CustomResponse extends Response {
  locals: CustomLocals;
}