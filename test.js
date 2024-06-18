const request = require('supertest');
const app = require('./index.js');


describe('POST /signup', () => {
  it('should create a new user', async () => {
    const userData = {
      email: 'kakash@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'testpassword',
      address: '123 Test St',
      bio: 'Test bio',
      expertise: 'Test expertise',
      occupation: 'Test occupation'
    };

    const response = await request(app)
      .post('/signup')
      .send(userData)
      .expect(201);

    // Verify the response
    const { body } = response;
    expect(body).to.have.property('uid');
    expect(body).to.have.property('email', userData.email);
    expect(body).to.have.property('firstName', userData.firstName);
    expect(body).to.have.property('lastName', userData.lastName);
    expect(body).to.have.property('address', userData.address);
    expect(body).to.have.property('bio', userData.bio);
    expect(body).to.have.property('expertise', userData.expertise);
    expect(body).to.have.property('occupation', userData.occupation);
    expect(body).to.have.property('success', true);
    expect(body).to.have.property('message', 'User Created Successfully');
  });

  it('should return 400 if email or password is missing', async () => {
    const userData = {
      email: 'kakash@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'testpassword',
      address: '123 Test St',
      bio: 'Test bio',
      expertise: 'Test expertise',
      occupation: 'Test occupation'
    };

    // Remove password to simulate missing password
    delete userData.password;

    const response = await request(app)
      .post('/signup')
      .send(userData)
      .expect(400);

    // Verify the response
    const { body } = response;
    expect(body).to.have.property('success', false);
    expect(body).to.have.property('message', 'Email and password are required');
  });

  it('should return 500 if there is an error creating user', async () => {
    const userData = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'testpassword',
      address: '123 Test St',
      bio: 'Test bio',
      expertise: 'Test expertise',
      occupation: 'Test occupation'
    };

    // Mocking an error by using an existing email
    const response = await request(app)
      .post('/signup')
      .send(userData)
      .expect(500);

    // Verify the response
    const { body } = response;
    expect(body).to.have.property('success', false);
    expect(body).to.have.property('message', 'Error creating user');
    expect(body).to.have.property('error');
  });
});


describe("POST /signin", function() {
  it("it should have status code 200 if the user successfully logs in", function(done) {
    request
   .post('/signin')
   .send({"email": user.email, password: "123456"})
      .expect(200)
      .end(function(err, res){
        if (err) done(err);
        done();
      });
  });
});

describe("POST /createMentor", function() {
    
  it("it should have status code 200 if the mentor is successfully created", function(done) {
    request
    
   .post('/createMentor')
   .send({"email": user.email, password: "123456"})

    .expect(200)
    .end(function(err, res){
      if (err) done(err);
      done();
    });
});
});

describe('POST /sessions/:sessionId/review', () => {
  it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
          .post('/sessions/123456/review')
          .send({});
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'menteeId, rating, and comments are required');
  });

  it('should return 404 if session not found', async () => {
      const res = await request(app)
          .post('/sessions/nonexistent/review')
          .send({
              menteeId: 'mentee123',
              rating: 4,
              comments: 'Great session!'
          });
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Mentorship session not found');
  });

  it('should return 403 if user is not authorized to review session', async () => {
      // Mock data
      const sessionId = 'session123';
      const menteeId = 'mentee123';

      const res = await request(app)
          .post(`/sessions/${sessionId}/review`)
          .send({
              menteeId: 'anotherMentee',
              rating: 4,
              comments: 'Great session!'
          });
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'You are not authorized to review this session');
  });

  it('should add a review to the session', async () => {
      // Mock data
      const sessionId = 'session123';
      const menteeId = 'mentee123';

      const res = await request(app)
          .post(`/sessions/${sessionId}/review`)
          .send({
              menteeId,
              rating: 4,
              comments: 'Great session!'
          });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, 'Review added successfully');
      assert.strictEqual(res.body.data.sessionId, sessionId);
      assert.strictEqual(res.body.data.menteeId, menteeId);
      assert.strictEqual(res.body.data.rating, 4);
      assert.strictEqual(res.body.data.comments, 'Great session!');
      assert(res.body.data.reviewDate);
  });
});

describe('POST /createMentor', () => {
  it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
          .post('/createMentor')
          .send({});
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Email and password are required');
  });

  it('should create a mentor', async () => {
      // Mock data
      const mentorData = {
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'password123',
          address: '123 Test St',
          bio: 'I am a mentor',
          expertise: 'Programming',
          occupation: 'Software Engineer'
      };

      const res = await request(app)
          .post('/createMentor')
          .send(mentorData);
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, 'Mentor Created Successfully');
      assert(res.body.uid);
      assert.strictEqual(res.body.email, mentorData.email);
      assert.strictEqual(res.body.firstName, mentorData.firstName);
      assert.strictEqual(res.body.lastName, mentorData.lastName);
      assert.strictEqual(res.body.address, mentorData.address);
      assert.strictEqual(res.body.bio, mentorData.bio);
      assert.strictEqual(res.body.expertise, mentorData.expertise);
      assert.strictEqual(res.body.occupation, mentorData.occupation);
  });
});

describe('POST /createAdmin', () => {
  it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
          .post('/createAdmin')
          .send({});
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Email and password are required');
  });

  it('should create an admin', async () => {
      // Mock data
      const adminData = {
          email: 'admin@example.com',
          password: 'password123'
      };

      const res = await request(app)
          .post('/createAdmin')
          .send(adminData);
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.role, 'admin');
      assert(res.body.uid);
      assert.strictEqual(res.body.email, adminData.email);
  });
});