import '@babel/polyfill';
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from "body-parser";

dotenv.config();

const PAYLOAD_LIMIT = 1e6

const app = express();

app.use(bodyParser.json({limit: PAYLOAD_LIMIT}));
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err && err.type === 'entity.parse.failed') {

        res.status(400);
        res.set('Content-Type', 'application/json');
        res.json({message: 'Payload should be in JSON format'});
        return;
    }
    next();
});

app.post('/users', (req, res) => {


    if (req.headers['content-type'] !== 'application/json') {
        res.status(415);
        res.set('Content-Type', 'application/json');
        res.json({message: 'The "Content-Type" header must always be "application/json"'});
        return;
    }

    if (req.headers['content-length'] == 0) {
        res.status(400);
        res.set('Content-Type', 'application/json');
        res.json({message: 'Payload should not be empty'});
        return;
    }
    res.status(400);
    res.set('Content-Type', 'application/json');
    res.json({
        message: 'Payload should be in JSON format',
    });

});


app.listen(process.env.SERVER_PORT, () => {
    console.log(`Hobnob API server listening on port ${process.env.SERVER_PORT}!`)
});