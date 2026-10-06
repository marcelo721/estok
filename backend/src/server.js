import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { ENV } from './config/env.js';
import apiRoutes from './routes/api.js';

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado pelo CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api', apiRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Erro interno do servidor.'
  });
});

app.listen(ENV.PORT, () => {
  console.log(`Servidor Estok rodando na porta ${ENV.PORT}`);
});