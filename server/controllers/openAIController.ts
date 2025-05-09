import OpenAI from 'openai';
import { RequestHandler, Request, NextFunction } from 'express';
import { CustomResponse } from '../types';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.OPENAI_KEY) {
  throw new Error('Missing required environment variable: OPENAI_KEY');
}

const openAIClient = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

interface OpenAIEmbeddingResponse {
  data: { embedding: number[] }[];
}

interface OpenAIChatResponse {
  choices: { message: { content: string } }[];
}

export const queryOpenAIEmbedding: RequestHandler = async (
  _req: Request, 
  res: CustomResponse, 
  next: NextFunction
) => {
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
    const embedding: OpenAIEmbeddingResponse = await openAIClient.embeddings.create({
      model: 'text-embedding-3-small',
      input: `${userQuery}`,
      encoding_format: 'float',
    });

    if (!embedding.data || !embedding.data[0]?.embedding) {
      throw new Error('OpenAI refuses to embed you');
    }

    res.locals.embedding = embedding.data[0].embedding;
    return next();
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

export const queryOpenAIChat: RequestHandler = async (
  req: Request, 
  res: CustomResponse, 
  next: NextFunction
) => {
  const { userQuery, pineconeQueryResult } = res.locals;

  if (!userQuery || !pineconeQueryResult) {
    const error = {
      log: 'userQuery or pineconeQueryResult chose not to respond.',
      code: 500,
      message: { err: 'We are not allowing you to query OpenAI... You do not deserve it...' },
    };
    return next(error);
  }

  try {
    const response: OpenAIChatResponse = await openAIClient.responses.create({
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
      temperature: 0.8,
    });

    if (!response.choices || !response.choices[0]?.message?.content) {
      throw new Error('OpenAI does not want to chat with you right now')
    }

    res.locals.newPokemon = response.choices[0].message.content; // <- we never set the res.locals to a value
    return next(); // <- or return next after
  } catch (err) {
    const error = {
      log: 'issue with openAI response',
      code: 500,
      message: { err: 'An error quering openAI chat' },
    };
    return next(error);
  }
};
