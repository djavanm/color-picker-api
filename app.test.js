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
      expect(response.body.id).toEqual(expectedUser.id);
    });

    it('should return a 422 status code if there is a missing parameter in request body', async () => {
      const newUserInfo = { password: '12345'};
      const response = await request(app).post('/user').send(newUserInfo);
      expect(response.status).toBe(422);
      expect(response.body.error).toEqual("Expected format: { email: <string>, password: <string> }. You are missing a value for email.")
      
    });

  });

});