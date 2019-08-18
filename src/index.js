import '@babel/polyfill';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const requestHandler = function (req, res) {
    console.log(req.connection.remoteAddress);
    if (req.method === 'POST' && req.url === '/users') {
        res.writeHead(400, {'Content-Type': 'application/json'})
        res.end(JSON.stringify({
            message: 'Payload should not be empty',
        }));
        return;

    }
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.end('Hello world !');
};

const server = http.createServer(requestHandler);
server.listen(process.env.SERVER_PORT);
console.log("Server has been started");