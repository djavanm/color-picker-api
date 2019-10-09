const request = require('supertest');
const app = require('./app');
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

describe('Server', () => {

  beforeEach( async () => {
    await database.seed.run();
  });

  describe('init', () => {
    it('should return a 200 status', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
    });
  });

  describe('GET /user', () => {
    it('should return a 200 status code and user ID when user logs', async () => {
      const expectedUser = await database('users').select().first();
      const { email, password, id } = expectedUser;
      const response = await request(app).get('/user').send({email, password});
      expect(response.body.id).toEqual(id);
    });

    it('should return a 400 status and error message if email or password is missing.', async () => {
      const userLoginInfo = { password: '12345'};
      const response = await request(app).get('/user').send(userLoginInfo);
      const missingEmailError = `Expected format: { email: <string>, password: <string> }. You are missing a value for email.`;
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual(missingEmailError);
    });

    it('should return a 400 status and error message if email or password is incorrect.', async () => {
      const userLoginInfo = { email: '12345', password: 'bob'};
      const response = await request(app).get('/user').send(userLoginInfo);
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual("Unable to verify user.");
    });
  });

  describe('GET /projects/:id', () => {
    it('should return a 200 status code and all the projects associated with the user via user_id', async () => {
      const user = await database('users').select().first();
      const response = await request(app).get(`/projects/${user.id}`);
      const expectedProjects = await database('projects').where('user_id', user.id).select();
      expect(response.body[0].name).toEqual(expectedProjects[0].name);
    })
  })

  describe('GET /palettes/:id', () => {
    it('should return a 200 status code and all the palettes associated with the project via project_id', async () => {
      const { id } = await database('projects').first();
      const response = await request(app).get(`/palettes/${id}`);
      const expectedPalettes = await database('palettes').where('project_id', id).select();
      const { name, hex_codes } = response.body[0];

      expect(name).toEqual(expectedPalettes[0].name)
      expect(hex_codes).toEqual(expectedPalettes[0].hex_codes)
    })
  })

  describe('GET /palettes', () => {
    it('should return a 200 status code and all the palettes ', async () => {
      const response = await request(app).get('/palettes');
      const expectedPalettes = await database('palettes').select();
      const { name, hex_codes } = response.body[0];

      expect(name).toEqual(expectedPalettes[0].name)
      expect(hex_codes).toEqual(expectedPalettes[0].hex_codes)
    })
  })

  describe('POST /user', () => {
    it('should return a 201 status code and a new user Id', async () => {
      const newUserInfo = { email: 'hellokitty@turing.io', password: '12345'};
      const response = await request(app).post('/user').send(newUserInfo);
      const expectedUser = await database('users').where('email', newUserInfo.email).first();
      expect(response.status).toBe(201);
      expect(response.body.id).toEqual(expectedUser.id);
    });

    it('should return a 422 status code if there is a missing parameter in request body', async () => {
      const newUserInfo = { password: '12345'};
      const response = await request(app).post('/user').send(newUserInfo);
      expect(response.status).toBe(422);
      expect(response.body.error).toEqual("Expected format: { email: <string>, password: <string> }. You are missing a value for email.")
    });

    it('should return a 401 status code if the email is already in use.', async () => {
      const newUserInfo = { email: "bob@gmail.com", password: '12345'};
      const response = await request(app).post('/user').send(newUserInfo);
      expect(response.status).toBe(401);
      expect(response.body.error).toEqual("User already exists.");
    });
  });

  describe('POST /projects', () => {
    it('should return a 201 status code and a new project Id', async () => {
      const { id } = await database('users').first();
      const newProject = { name: "Project Pat", user_id: id };
      const response = await request(app).post('/projects').send(newProject);
      const expectedProject = await database('projects').where('id', response.body.id).first();
      expect(response.status).toBe(201);
      expect(newProject.name).toEqual(expectedProject.name);
      expect(response.body.id).toEqual(expectedProject.id);
    });

    it('should return a 422 status code if there is a missing parameter in request body', async () => {
      const newProject = { name: "Cool colors"};
      const response = await request(app).post('/projects').send(newProject);
      expect(response.status).toBe(422);
      expect(response.body.error).toEqual("Expected format: { name: <string>, user_id: <integer> }. You are missing a value for user_id.");
    });
  });

  describe('POST /palettes', () => {
    it('should return a 201 status code and a new project Id', async () => {
      const { id } = await database('projects').first();
      const newPalette = { name: "Super Dope colors", hex_codes:"#FFFFFF,#000000,#808080,#A9A9A9,#FF0000", project_id: id };
      const response = await request(app).post('/palettes').send(newPalette);
      const expectedPalette = await database('palettes').where('id', response.body.id).first();
      expect(response.status).toBe(201);
      expect(newPalette.name).toEqual(expectedPalette.name);
      expect(response.body.id).toEqual(expectedPalette.id);
    });

    it('should return a 422 status code if there is a missing parameter in request body', async () => {
      const newPalette = { name: "Super Dope colors" };
      const response = await request(app).post('/palettes').send(newPalette);
      expect(response.status).toBe(422);
      expect(response.body.error).toEqual("Expected format: { name: <string>, hex_codes: <string>, project_id: <integer> }. You are missing a value for hex_codes.");
    });
  });

  describe('DELETE /palettes/:id', () => {
    it('should delete and return a 204 status code', async () => {
      const { id } = await database('palettes').first();
      const response = await request(app).delete(`/palettes/${id}`);

      expect(response.status).toBe(204);
    });
  });

  describe('DELETE /projects/:id', () => {
    it('should delete a project and all its associated palettes return a 204 status code', async () => {
      const { id } = await database('projects').first();
      const response = await request(app).delete(`/projects/${id}`);

      expect(response.status).toBe(204);
    });
  });

  describe('PATCH /palettes/:id', () => {
    it('should update a palette name and return a 200 status code', async () => {
      const { id } = await database('palettes').first();
      const response = await request(app).patch(`/palettes/${id}`).send({name: 'Palette Pat'});
      expect(response.status).toBe(200);
      expect(response.body.name).toEqual('Palette Pat');
    });
  });
  
  describe('PATCH /projects/:id', () => {
    it('should update a project name and return a 200 status code', async () => {
      const { id } = await database('projects').first();
      const response = await request(app).patch(`/projects/${id}`).send({name: 'Project Pat'});
      expect(response.status).toBe(200);
      expect(response.body.name).toEqual('Project Pat');
    });
  });
});