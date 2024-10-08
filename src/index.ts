import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5001;

app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', 'src/views');

app.use(morgan('dev'));

app.get('/', async (request: express.Request, response: express.Response) => {
  response.send('Welcome!');
});

app.listen(PORT, () => {
  console.log(`Server started and is listening on http://localhost:${PORT}`);
});
