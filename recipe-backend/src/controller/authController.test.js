const fs = require('fs');
const {
	beforeAll,
	afterAll,
	test,
	expect,
	describe,
} = require('@jest/globals');
const request = require('supertest');
const { app, start, stop } = require('../app');
const path = require('path');

describe('signupUser for local signup', () => {
	let server;
	
	const port = 5001;
	
	beforeAll(() => {
		server = start(port);
	});
	
	afterAll(() => {
		server.close()
	});



	test("should return 409 if user is already in use ", async () => {
		const req = {
			body: {
				name: 'User1',
				email: 'user1@web.de',
				password:"123456",
				loginMethod: "local"}
		};
		const response = await request(app).post('/auth/signup').send(req.body);
		expect(response.status).toBe(409);
	})


	test("should return 201 if user is successfully created ", async () => {

		const data = await new Promise((resolve, reject) => {
			fs.readFile(
				path.join(__dirname, '../mockDB.json'),
				'utf8',
				(err, data) => {
					if (err) {
						reject(err);
					} else {
						resolve(data);
					}
				}
			);
		});

		const userArrays = await JSON.parse(data);

		let userNameNumber = userArrays.user.length * Math.random();

		const req = {
			body: {
				name: `user${userNameNumber}`,
				email: `user${userNameNumber}@web.de`,
				password:"123456",
				loginMethod: "local"
			}
		};
		const response = await request(app).post('/auth/signup').send(req.body);

		expect(response.status).toBe(201);
	})

	test('should return 400 if password is missing', async () => {
		const req = {
			body: {
				name: 'User1',
				loginMethod: "local"
			},
		};

		const response = await request(app).post('/auth/signup').send(req.body);

		expect(response.status).toBe(400);
	});

	test('login should return 400 if email is missing', async () => {
		const req = {
			body: {
				name: 'Schlacki',
				password:"123456",
				loginMethod: "local"
			}
		};

		const response = await request(app).post('/auth/login').send(req.body);

		expect(response.status).toBe(400);
	});


	test("login should return 401 if credentials are wrong", async () => {
		const req = {
			body: {
				name: 'User1',
				email: 'user1@web.de',
				password: "Holadrio",
				loginMethod: "local"
			}
		};
		const response = await request(app).post('/auth/login').send(req.body);

		expect(response.status).toBe(401);

	});
});