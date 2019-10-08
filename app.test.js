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
    it('should return a 200 status code when a user logs in', async () => {
      const expectedUser = await database('users').select().first();
      // console.log(expectedUser)
      const { email, password, id } = expectedUser;
      // console.log('email', email)
      const response = await request(app).get('/user').send({email, password});
      // console.log(response.body)
      expect(response.body.id).toEqual(id);
    });
  
  });
});