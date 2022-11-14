const express = require('express');
const app = express();
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../') + '.env' });

app.use(express.json());

app.use('/api/v1/catalog-service/api', require('./controller/crudController'));

app.use((req, res) => {
    console.log('in 404')
    res.status(404).send('No such API');
});
app.use((err, req, res) => {
    console.error(err);
    res.status(500).send(err.response || 'Something broke!');
});
const server = app.listen(8080, function () {
    const port = server.address().port;
    console.log("Microservice is running at port:" + port);
});
