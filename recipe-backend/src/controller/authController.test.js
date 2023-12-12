const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
	
	beforeAll(async () => {
		server = start(port);

		await prisma.userLocal.create({
			data: {
				name: 'User1',
				email: 'user1@web.de',
				password:"123456"}
			});
	});
	
	afterAll(async () => {
		await prisma.userLocal.deleteMany();
		server.close()
	});


	test("should return 409 if user is already in use ", async () => {
		const req = {
			body: {
				name: 'User1',
				email: 'user1@web.de',
				password:"123456"
			}
		};
		const response = await request(app).post('/auth/signup').send(req.body);
		expect(response.status).toBe(409);
	})


	test("should return 201 if user is successfully created ", async () => {

		const req = {
			body: {
				name: 'User2',
				email: 'user2@example.com',
				password:"123456"
			}
		}

		const response = await request(app).post('/auth/signup').send(req.body);

		expect(response.status).toBe(201);
	})

	test('should return 400 if password is missing', async () => {
		const req = {
			body: {
				name: 'User1',
				email: 'user1@example.com'
			},
		};

		const response = await request(app).post('/auth/signup').send(req.body);

		expect(response.status).toBe(400);
	});

	test('login should return 400 if email is missing', async () => {
		const req = {
			body: {
				name: 'Schlacki',
				password:"123456"
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
				password: "Holadrio"
			}
		};
		const response = await request(app).post('/auth/login').send(req.body);

		expect(response.status).toBe(401);

	});
});