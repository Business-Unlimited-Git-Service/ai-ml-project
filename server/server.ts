import express, { Request, Response, NextFunction} from 'express';
import cors from 'cors';
import 'dotenv/config';


const app = express();

app.use(cors());
app.use(express.json());


app.post('/api', (_req,res)=>{
    res.status(200).json({rec:res.locals.ai})
} )

app.use((err:any, req: Request, res: Response, _next: NextFunction): void => {
    const defaultErr = {
      log: 'Express error handler caught unknown middleware error',
      status: 500,
      message: { err: 'An error occurred' },
    };
    const errorObj = Object.assign({}, defaultErr, err);
    console.log(errorObj.log);
   res.status(errorObj.status).json(errorObj.message);
   return;
  });

app.listen(8080, () => console.log('Listening On PORT 8080'));