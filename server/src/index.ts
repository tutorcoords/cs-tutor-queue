import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import authRoutes from './authentication';
import routes from './routes';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('client-dist'));

//allows for json body parsing
app.use(bodyParser.json());
//allows for url encoded body parsing
app.use(bodyParser.urlencoded({ extended: true }));

//external routes
app.use('/api', routes);
app.use('/api', authRoutes);

//handle react routing
app.use('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '/../client-dist', 'index.html'));
});

app.listen(port, () => console.log(`app listening on port ${port}`));