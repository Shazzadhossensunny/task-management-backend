import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';

const app: Application = express();

//parsers
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
// app.use(
//   cors({
//     origin: ['http://localhost:5173', 'https://bike-shop-ecru.vercel.app'],
//     credentials: true,
//   }),
// );

//application routes
app.use('/api', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});
// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Task Management API is running!',
    timestamp: new Date().toISOString(),
  });
});
app.use(globalErrorHandler);
app.use(notFound as any);

export default app;
