const express = require('express')
const app = express();
//const port = 8050;
const api = require("./app/routes/api");
const apidoc = require("./app/routes/api-doc");
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

let mongoose = require('mongoose'); // for working w/ our database
let config = require('./config');

mongoose.Promise = global.Promise;
mongoose.connect(config.database, { useUnifiedTopology: true, useNewUrlParser: true });

let conn = mongoose.connection;
conn.on('error', function(err){
    console.log('mongoose connection error:', err.message);
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.raw({limit: '5mb'}) );

// configure our app to handle CORS requests
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'x-access-token,X-Requested-With,Content-Type,Authorization');
    res.setHeader('X-Powered-By', 'Lucky Lucciano');
    next();
});


//for swagger def
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerDocument));

app.use("/api/v1", api);
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', function(req, res) {
	//res.sendFile(path.join(__dirname, 'public', 'index.html'));
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

let port = process.env.PORT;
if (port == null || port == "") {
	port = 8050;
}

app.listen(port, () => console.log(`Listening on port ${port}!`))