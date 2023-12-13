const request = require('supertest');
const { test, expect, describe } = require('@jest/globals');
const { signupUserModel, loginUserModel } = require('./userModel');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('login if possible', () => {
	let server;

	const port = 5001;

	beforeAll(() => {
		server = start(port);
	});

	afterAll(() => {
		server.close();
	});

	// Vor jedem Test leeren wir die Datenbank
	beforeEach(async () => {
		await prisma.UserLocal.deleteMany(); // Löscht alle User-Einträge
		// Setzt die Auto-Inkrementierung der ID zurück. Das geht nur mit einem rohen SQL-Befehl.
		await prisma.$executeRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1`;
	});

	test('should return null if password is incorrect', async () => {
		// Erstelle 1 Benutzer
		await prisma.UserLocal.create({
			data: {
				name: 'User 1',
				email: 'user1@example.com',
				password: '12345',
			},
		});

		const response = await loginUserModel(user.email, user.password);

		console.log('RESPONSE', response);
		expect(response).toBe(null);
	});

	test('should return user if user is successfully logged in', async () => {
		const data = await getUserJson();

		// Parse die Benutzer aus den gelesenen Daten
		const userArrays = JSON.parse(data);

		let userNameNumber = userArrays.user.length * 3;

		const user = {
			name: `user${userNameNumber}`,
			email: `user${userNameNumber}@web.de`,
			password: '123456',
			loginMethod: 'local',
		};

		// const response = await request(app).post('/auth/signup').send(req.body);
		const response = await loginUserModel(user.email, user.password);

		expect(response).toBeDefined();
	});

	test('should return null if user is not defined', async () => {
		// Parse die Benutzer aus den gelesenen Daten

		const user = {
			email: `dasIstEinTestUser123456789@web.de`,
			password: '123456',
		};

		// const response = await request(app).post('/auth/signup').send(req.body);
		const response = await loginUserModel(user.email, user.password);

		expect(response).toBe(null);
	});
});
