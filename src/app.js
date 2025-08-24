import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());

// Middleware específico para webhooks de Stripe (debe estar antes de express.json)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Middleware para el resto de las rutas
app.use(express.json());

app.use('/api', router);

app.use(errorHandler);

export default app;