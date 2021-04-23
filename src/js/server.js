var connect = require('connect');
const serveStatic = require('serve-static');
var app=connect();
app.use(serveStatic("./"));
app.listen(8080);


