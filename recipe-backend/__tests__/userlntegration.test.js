// Importieren der benötigten Funktionen und Module
const {
	it,
	test,
	expect,
	describe,
	beforeEach,
	afterEach,
} = require('@jest/globals');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const request = require('supertest');
const { loginUserModel } = require('../src/models/userModel');
const { authController } = require('../src/controller/authController');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { app, start } = require('../src/app');

let server;
const port = 5001;

// Bevor alle Tests ausgeführt werden, starten wir unseren Server auf dem definierten Port.
beforeAll(() => {
	server = start(port);
});

// Nachdem alle Tests ausgeführt wurden, schließen wir unseren Server.
afterAll((done) => {
	server.close(done);
});

// Vor jedem Test leeren wir die Datenbank
beforeEach(async () => {
	await prisma.userLocal.deleteMany(); // Löscht alle User-Einträge
	// Setzt die Auto-Inkrementierung der ID zurück. Das geht nur mit einem rohen SQL-Befehl.
	await prisma.$executeRaw`ALTER SEQUENCE "UserLocal_id_seq" RESTART WITH 1`;
});

afterEach(async () => {
	await prisma.$disconnect();
});

// ******* DATENBANK TEST *******
describe('Datenbank', () => {
	it('sollte eine Verbindung zur Datenbank herstellen', async () => {
		try {
			// Führt eine einfache Abfrage aus, um die Datenbankverbindung zu testen
			const result = await prisma.$queryRaw`SELECT 1;`;

			// Überprüfen, ob die Abfrage erfolgreich war
			expect(result).toEqual([{ '?column?': 1 }]);
		} catch (error) {
			// Wenn ein Fehler auftritt, schlägt der Test fehl
			throw new Error('Verbindung zur Datenbank fehlggeschlagen.');
		}
	});
});

// ******* USER INTEGRATION TEST *******
describe('POST /auth/signup', () => {
	// Einen neuen Benutzer erstellen:
	it('soll einen neuen Benutzer erstellen', async () => {
		const res = await request(app).post('/auth/signup').send({
			name: 'User 1',
			email: 'user1@example.com',
			password: '12345',
		});

		expect(res.statusCode).toEqual(201);
		expect(res.body).toEqual({
			message: 'User wurde erfolgreich erstellt!',
			newUser: {
				name: 'User 1',
				email: 'user1@example.com',
			},
			token: expect.any(String),
		});
	});
	// Einen neuen Benutzer erstellen, wenn ein Feld leer ist:
	it('soll einen Fehler zurückgeben, wenn ein Feld fehlt', async () => {
		const res = await request(app).post('/auth/signup').send({
			name: 'User 1',
		});

		expect(res.statusCode).toEqual(400);
		expect(res.body).toEqual({
			message: 'Bitte alle Felder ausfüllen!',
		});
	});
	// Einen neuen Benutzer erstellen, wenn die Email schon existiert:
	it('soll einen Fehler zurückgeben, wenn die Email schon existiert', async () => {
		// Erstelle einen Benutzer
		await prisma.userLocal.create({
			data: {
				name: 'User 1',
				email: 'user1@example.com',
				password: '12345',
			},
		});
		const res = await request(app).post('/auth/signup').send({
			name: 'User 1',
			email: 'user1@example.com',
		});
		expect(res.statusCode).toEqual(409);
		expect(res.body).toEqual({
			message: 'Es existiert bereits ein User mit dieser E-Mail!',
		});
	});
});

describe('POST /auth/login', () => {
	// Einen Benutzer einloggen:
	it('soll einen Benutzer einloggen', async () => {
		// Erstelle einen Benutzer
		const hashedPassword = await bcrypt.hash('12345', saltRounds);
		await prisma.userLocal.create({
			data: {
				name: 'User 1',
				email: 'user1@example.com',
				password: hashedPassword,
			},
		});
		const res = await request(app).post('/auth/login').send({
			email: 'user1@example.com',
			password: '12345',
		});

		expect(res.statusCode).toEqual(200);
		expect(res.body).toEqual({
			message: 'User wurde erfolgreich eingeloggt!',
			user: {
				name: 'User 1',
				email: 'user1@example.com',
			},
			token: expect.any(String),
		});
	});

	// Einen Benutzer einloggen, wenn ein Feld leer ist:
	it('soll einen Fehler zurückgeben, wenn ein Feld fehlt', async () => {
		const res = await request(app).post('/auth/login').send({
			email: 'user1@example.com',
		});

		expect(res.statusCode).toEqual(400);
		expect(res.body).toEqual({
			message: 'Bitte alle Felder ausfüllen!',
		});
	});

	// Einen Benutzer einloggen, wenn die Email nicht existiert:
	it('soll einen Fehler zurückgeben, wenn die Email nicht existiert', async () => {
		const res = await request(app).post('/auth/login').send({
			email: 'user100@exxample.com',
			password: '12345',
		});

		expect(res.statusCode).toEqual(401);
		expect(res.body).toEqual({
			message: 'E-Mail oder Passwort ist falsch!',
		});
	});

	// Einen Benutzer einloggen, wenn das Passwort falsch ist:
	it('soll einen Fehler zurückgeben, wenn das Passwort falsch ist', async () => {
		// Erstelle einen Benutzer
		const hashedPassword = await bcrypt.hash('12345', saltRounds);
		await prisma.userLocal.create({
			data: {
				name: 'User 1',
				email: 'user1@example.com',
				password: hashedPassword,
			},
		});

		const res = await request(app).post('/auth/login').send({
			email: 'user1@example.com',
			password: '123456',
		});

		expect(res.statusCode).toEqual(401);
		expect(res.body).toEqual({
			message: 'E-Mail oder Passwort ist falsch!',
		});
	});
});
