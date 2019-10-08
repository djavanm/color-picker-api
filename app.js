const express = require('express');
const app = express();
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.set('port', 3001);
app.use(express.json());
// app.use(cors());

app.get('/', (request, response) => {
  response.send('Get ready to pick some colors')
});

app.get('/user', async (request, response) => {
  const userInfo = request.body;
  const { email, password } = userInfo;
  for (let requiredParameter of ['email', 'password']) {
    if (!userInfo[requiredParameter]) {
      return response.status(400).send({
        error: `Expected format: { email: <string>, password: <string> }. You are missing a value for ${requiredParameter}.`});
    };
  };
  const user = await database('users').where('email', email).first();
  if (user && user.password === password) {
    return response.status(200).json({id: user.id});
  } else {
    return response.status(400).json({error: "Unable to verify user."})
  }
});

app.get('/projects/:id', async (request, response) => {
  const userId = request.params.id;
  const userProjects = await database('projects').where('user_id', userId).select();
  
  return response.status(200).json(userProjects)
})

app.get('/palettes/:id', async (request, response) => {
  const { id } = request.params
  const projectPalettes = await database('palettes').where('project_id', id).select();

  return response.status(200).json(projectPalettes)
})

app.get('/palettes', async (request, response) => {
  const palettes = await database('palettes').select();

  return response.status(200).json(palettes)
});

app.post('/user', async (request, response) => {
  const newUser = request.body;
  for (let requiredParameter of ['email', 'password']) {
    if(!newUser[requiredParameter]) {
      return response.status(422).send({
        error: `Expected format: { email: <string>, password: <string> }. You are missing a value for ${requiredParameter}.`
      });
    };
  };
  const newId = await database('users').insert(newUser, 'id');
  return response.status(201).json({ id: newId[0] });
});

app.post('/projects', async (request, response) => {
  const newProject = request.body;
  for (let requiredParameter of ['name', 'user_id']) {
    if(!newProject[requiredParameter]) {
      return response.status(422).send({
        error: `Expected format: { name: <string>, user_id: <integer> }. You are missing a value for ${requiredParameter}.`
      });
    };
  };
  const newId = await database('projects').insert(newProject, 'id');
  return response.status(201).json({ id: newId[0] });
});

module.exports = app;