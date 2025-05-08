//function 1:
//get csv file of pokemon pokedex (whichever one)
//look at that data and make an openaiQuery to make a json file out of that pokemon data using chatgpt 4.1 and chat.responses/chat.completions api
import fs from 'fs/promises';
import fsNormal from 'fs'
import dotenv from 'dotenv';
import Openai from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const client = new Openai({apiKey: process.env.OPENAI_KEY})
declare const __filename: string;
declare const __dirname: string;

//! is our prompt below supposed to generate embeddings

const systemPrompt = `
You are a professional CSV parser that is trying to make a JSONL file from a csv file. the JSONL output must be compatible with openai batch embedding format.

The CSV file has the following structure with content delimited by the following fields:

national_number,gen,name,primary_type,secondary_type,classification,height_m,weight_kg,abilities,description

An example of how these fields map to values in the provided csv file are as follows:

1,I,Bulbasaur,grass,poison,Seed Pokémon,0.7,6.9,Overgrow,There is a plant seed on its back right from the day this Pokémon is born. The seed slowly grows larger.

All fields are mandatory execept for secondary typing, which is optional. if it is not present, it does not need to be included for that data element.

You MUST convert the data into a JSON array, the JSON array must be stored in a JSONL file. 

The format below is the expected format for each line in the JSONL file. assign the name of each pokemon as the custom_id and the input to be the respective line of data read from the CSV file as POKEMONSTRING.

{"custom_id": "ANOTHER_ID_THAT_HELPS_YOU_IDENTIFY_IT_LATER", "method": "POST", "url": "/v1/embeddings", "body": {"model": "text-embedding-3-small", "input": "POKEMONSTRING": "float"}}

Each custom_id MUST be on its own line. There must not be any / in your response. Ensure that instead of /n the output is actually spaced to the next line.
Your response must only include the request JSONL object with no other comments or text response.
`

/*
{
dataset interface:
national_number: number,
gen: string,
name: string,
primary_type: string,
secondary_type: string,
classification: string,
height_m: number,
weight_kg: number,
abilities: string,
description: string
}

dataset examples:
Categorical Fields:
{
national_number: 1,
gen: "I",
name: "Bulbasaur",
primary_type: "grass",
secondary_type: "poison",
classification: "Seed Pokémon",
height_m: 0.7,
weight_kg: 6.9,
abilities: "Overgrow",
description: "There is a plant seed on its back right from the day this Pokémon is born. 
The seed slowly grows larger."
}


String:
Pros: better Pinecone score for embeddings

{
"Bulbasaur": "1,I,Bulbasaur,grass,poison,Seed Pokémon,0.7,6.9,Overgrow,There is a plant seed on its back right from the day this Pokémon is born. The seed slowly grows larger."
}

*/
   


async function getpkmnJSONFile() {

    const pokemons = await fs.readFile(path.resolve(__dirname, 'pokemonsmini.csv'), 'utf-8');
    const pokemonsArray = pokemons.split('\n');
    const chunkSize = 100;
    for (let i = 0; i < pokemonsArray.length; i += chunkSize) {
    const chunk = pokemonsArray.slice(i, i + chunkSize).join('\n');
    const gptResponse = await client.responses.create({
        model: "gpt-4.1",
        input: [
            {
                role: "system",
                content: `${systemPrompt}`
            },
            {
                role:"user",
                content: chunk
            }
        ],
    });
    // console.log(gptResponse.output_text)
    
    const dbResponse = {
        AIResponse: gptResponse.output_text
      }
    
    // await fs.appendFile(path.resolve(__dirname, 'response.json'), JSON.stringify(dbResponse, null, 2) + "\n", "utf-8");
    await fs.appendFile(path.resolve(__dirname, 'response.jsonl'), dbResponse.AIResponse, "utf-8");
    }
}
// getpkmnJSONFile()




//function 2: 
//take that json file
//and make batch query using openai batch api to obtain embeddings (text-embedding-3-small)
// async function batch
async function uploadFile(){
    try {
        const file = await client.files.create({
          file: fsNormal.createReadStream("miniresponse.jsonl"),
          purpose: "batch",
        });
        console.log("File uploaded successfully in uploadFile")
        console.log("file:", file)
    } catch (error) {
        console.error("Embedding error", error);
    }
}
// uploadFile()
// file: {
//     object: 'file',
//     id: 'file-QQPWqahEPfmz9mx3kVocnE',
//     purpose: 'batch',
//     filename: 'miniresponse.jsonl',
//     bytes: 1191,
//     created_at: 1746733130,
//     expires_at: null,
//     status: 'processed',
//     status_details: null
//   }


async function getEmbeddings(){
    try {
        const createBatches = await client.batches.create({
          input_file_id:'file-QQPWqahEPfmz9mx3kVocnE',
          endpoint:"/v1/embeddings",
          completion_window:"24h"
    });
    console.log(createBatches)
        console.log("createBatches created successfully")
    } catch (error) {
        console.error("Embedding error", error);
}
}
// {
//     id: 'batch_681d09f25cc08190917b983473edb1be',
//     object: 'batch',
//     endpoint: '/v1/embeddings',
//     errors: null,
//     input_file_id: 'file-QQPWqahEPfmz9mx3kVocnE',
//     completion_window: '24h',
//     status: 'validating',
//     output_file_id: null,
//     error_file_id: null,
//     created_at: 1746733554,
//     in_progress_at: null,
//     expires_at: 1746819954,
//     finalizing_at: null,
//     completed_at: null,
//     failed_at: null,
//     expired_at: null,
//     cancelling_at: null,
//     cancelled_at: null,
//     request_counts: { total: 0, completed: 0, failed: 0 },
//     metadata: null
//   }

    // getEmbeddings()

    // const embedding = await openAIClient.embeddings.create({
    //     model: 'text-embedding-3-small',
    //     input: `${userQuery}`,
    //     encoding_format: 'float',
    //   });
    //   res.locals.embedding = embedding.data[0].embedding;

    async function getStatus() {
        const batch = await client.batches.retrieve('batch_681d09f25cc08190917b983473edb1be');
        console.log(batch);

    }

// getStatus()

const results = async () => {
    const resultsArray = [];
    // output file goes as parameter of content('output file')
    const fileResponse = await client.files.content('file-YEHL8M3heHkFk4f2TgewEg');
    const fileContents = await fileResponse.text();
    console.log('fileContents:', fileContents);
    const res: any = fileContents + ',';
    console.log('res:', res)
    fs.writeFile(path.resolve(__dirname, 'embeddings.jsonl'), res, "utf-8");

    const lines = text.trim().split("\n").map(line => JSON.parse(line));
}    

results();



//function 3:
//take that output (in whatever form, could be file, could just be big object, file probably better ?) upload to menachem's pinecone
//we have to like structure the information in a way pinecone accepts it (minor but recall that it accepts metadata not just embeddings)
