import OpenAI from 'openai';
import { RequestHandler } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const openAIClient = new OpenAI({
  apiKey: process.env.OPENAI_KEY as string,
});

export const queryOpenAIEmbedding: RequestHandler = async (_req, res, next) => {
  const { userQuery } = res.locals;

  if (!userQuery) {
    next({
      log: 'queryOpenAiEmbedding did not receive a user query',
      status: 500,
      message: { err: 'An error occurred before querying OpenAI' },
    });
    return;
  }
  try {
    const embedding = await openAIClient.embeddings.create({
      model: 'text-embedding-3-small',
      input: `${userQuery}`,
      encoding_format: 'float',
    });
    res.locals.embedding = embedding.data[0].embedding;
    
  } catch (err) {
    next({
      log: 'queryOpenAiEmbedding could not create embedding',
      status: 500,
      message: {
        err: 'An error occurred in obtaining an embedding from openAI',
      },
    });
    return;
  }
};

export const queryOpenAIChat: RequestHandler = async (req, res, next) => {
  const { userQuery, pineconeQueryResult } = res.locals;

  if (!userQuery || !pineconeQueryResult) {
    const error = {
      log: 'userquery or pinecone query have not been received',
      code: 500,
      message: { err: 'An error occured before querying OpenAI' },
    };
    return next(error);
  }

  try {
    const response = await openAIClient.responses.create({
      model: 'gpt-4.1',
      input: [
        {
          role: 'developer',
          content: `${pineconeQueryResult}`,
        },
        {
          role: 'user',
          content: `${userQuery}`,
        },
      ],
    });
  } catch (err) {
    const error = {
      log: 'issue with openAI response',
      code: 500,
      message: { err: 'An error quering openAI chat' },
    };
    return next(error);
  }
};
