import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import config from './config/config.js';

import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import messageRoutes from './routes/message.routes.js';
import webrtcRoutes from './routes/webrtc.routes.js';

import authRouter from './routes/userAuth.js';
import problemRouter from './routes/problemRoutes.js';
import submissionRouter from './routes/submit.js';
import aiRouter from './routes/AiChat.js';
import videoRouter from './routes/video.js';
import payRoute from './routes/payment.js';
import interviewRouter from './routes/aiInterview.js';
import contestRouter from './routes/contestRoute.js';
import playlistRouter from './routes/playlistRoute.js';
import discussionRouter from './routes/discussionRoute.js';
import dsaRouter from './routes/dsa.js';
import userRouter from './routes/user.js';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

const normalizeOrigin = (origin) => (origin ? origin.replace(/\/+$/, '') : origin);
const allowedOrigins = config.FRONTEND_URLS.map(normalizeOrigin);

console.log('Allowed Origins:', allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const requestOrigin = normalizeOrigin(origin);
    if (allowedOrigins.includes(requestOrigin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(cookieParser());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.set('trust proxy', 1);

app.get('/', (req, res) => {
  res.json({
    message: 'CodeX API Server is running',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/webrtc', webrtcRoutes);

app.use('/api/user', authRouter);
app.use('/api/user', userRouter);
app.use('/api/problem', problemRouter);
app.use('/api/submission', submissionRouter);
app.use('/api/ai', aiRouter);
app.use('/api/video', videoRouter);
app.use('/api/payments', payRoute);
app.use('/api/ai', interviewRouter);
app.use('/api/contest', contestRouter);
app.use('/api/playlists', playlistRouter);
app.use('/api/discussions', discussionRouter);
app.use('/api/dsa', dsaRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

export default app;
