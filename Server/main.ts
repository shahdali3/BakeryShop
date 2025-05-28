import { Server } from 'http';
import express from 'express'
import path from 'path';
import dbConnection from './src/config/database';
import dotenv from 'dotenv';
import Routes from './src';
import i18n from 'i18n';
import hpp from 'hpp';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import expressMongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import csrf from 'csurf'
import morgan from 'morgan';
import ApiError from './src/utils/apiErrors';

const app: express.Application = express();

app.use(cors({
  // origin: (origin, callback) => {
  //   const allowedOrigins = ['*'];
  //   if (!origin || allowedOrigins.includes(origin)) {
  //     callback(null, true);
  //   } else {
  //     callback(new ApiError('Not allowed by CORS', 403));
  //   }
  // },
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization','X-CSRF-Token'],
  methods : ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials : true 
}));

app.use(express.json({ limit : '10kb' }));
app.use(expressMongoSanitize())
app.use(helmet({crossOriginResourcePolicy : {policy: 'same-site'}}));
app.use(cookieParser());
app.use(compression());
app.use(morgan('dev'));

let server : Server;
dotenv.config();
app.use(express.static('uploads'))
// http://localhost:4000/images/products/products.1736378718753-cover.webp



app.use(hpp({
  whitelist : ['price']
}));

i18n.configure({
  locales: ['en', 'ar'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'en',
  queryParameter: 'lang',
})

app.use(i18n.init);

dbConnection();
Routes(app);

app.get('/', function (req : express.Request, res: express.Response) : void {
  res.send('Hello World !!')
})

server = app.listen(process.env.PORT, ()  => {
  console.log(`Server running on port ${process.env.PORT} `);
})

process.on('unhandledRejection', (err : Error)  => {
  if (process.env.NODE_ENV === 'development') { 
    console.log(err);
  }
  console.log  (`unhandledRejection ${err.name} | ${err.message}`);
  server.close(()  => {
      
      console.log('shutting down the server ');
      process.exit(1);
  
  })
})
