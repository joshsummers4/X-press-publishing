const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const errorhandler = require('errorhandler');
const cors = require('cors');

//API router
const apiRouter = require('./api/api.js');

const app = express();
const PORT = process.env.PORT || 4002;

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

app.use('/api', apiRouter);

app.use(errorhandler());

//app start and listening 

app.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`)
});

module.exports = app;