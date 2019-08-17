import '@babel/polyfill';
import http from 'http';

const requestHandler = function (req, res) {
    console.log(req.connection.remoteAddress);
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.end('Hello world !');
};

const server = http.createServer(requestHandler);
server.listen(8080);