const http=require('http');

const requestHandler=function (req,res) {
  res.writeHead(200,{'Content-Type':'text/html'});
  res.end('Hello world !');
};

const server=http.createServer(requestHandler);
server.listen(8080);