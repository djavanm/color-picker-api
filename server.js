const express = require('express');
const app = express();
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.set('port', 3001);
app.use(express.json());
// app.use(cors());

app.listen(app.get('port'), () => {
  console.log(`App is listening on port ${app.get('port')}`)
});

app.get('/', (request, response) => {
  response.send('Get ready to pick some colors')
});