const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const User = require('../models/User');

chai.use(chaiHttp);
const { expect } = chai;

describe('User API Tests', () => {
  before(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/v1/users/register', () => {
    it('should register a new user', (done) => {
      chai
        .request(app)
        .post('/api/v1/users/register')
        .send({ name: 'John Doe', email: 'john@example.com', password: 'password123', role: 'normal' })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('_id');
          expect(res.body).to.have.property('name', 'John Doe');
          done();
        });
    });

    it('should not register a user with an existing email', (done) => {
      chai
        .request(app)
        .post('/api/v1/users/register')
        .send({ name: 'Duplicate User', email: 'john@example.com', password: 'password123' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('error');
          done();
        });
    });
  });

  describe('POST /api/v1/users/login', () => {
    it('should log in an existing user', (done) => {
      chai
        .request(app)
        .post('/api/v1/users/login')
        .send({ email: 'john@example.com', password: 'password123' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          done();
        });
    });

    it('should not log in with incorrect credentials', (done) => {
      chai
        .request(app)
        .post('/api/v1/users/login')
        .send({ email: 'john@example.com', password: 'wrongpassword' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('error');
          done();
        });
    });
  });
});
