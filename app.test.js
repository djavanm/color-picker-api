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
      const missingEmailError = `Expected format: { email: <string>, password: <string> }. You are missing a value for email`;
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
});