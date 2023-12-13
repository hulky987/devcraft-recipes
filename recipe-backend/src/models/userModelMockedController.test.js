// Importieren der benötigten Funktionen und Module
const {
	test,
	expect,
	describe,
	beforeEach,
	afterEach,
} = require('@jest/globals');
const { loginUserModel } = require('../models/userModel');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { app, start } = require('../app');

// Mocken des gesamten authController Moduls
jest.mock('../controller/authController');

// Importieren des gemockten Controllers
const { loginUser } = require('../controller/authController');

// Mocken des Controllers mit einem Userobjekt:
const mockUser = {
	id: 1,
	name: 'User 1',
	email: 'user1@example.com',
	password: 'hashedPassword',
};
// Mockuser im Controller setzen
loginUser.mockReturnValue(mockUser);

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
	// Erstellen eines einen Benutzers in der Datenbank
	await prisma.userLocal.create({
		data: {
			id: mockUser.id,
			name: mockUser.name,
			email: mockUser.email,
			password: bcrypt.hashSync(mockUser.password, 10),
		},
	});
});

afterEach(async () => {
	await prisma.userLocal.deleteMany(); // Löscht alle User-Einträge
	// Setzt die Auto-Inkrementierung der ID zurück. Das geht nur mit einem rohen SQL-Befehl.
	await prisma.$executeRaw`ALTER SEQUENCE "UserLocal_id_seq" RESTART WITH 1`;
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

// ******* MODEL TEST CONTROLLER GEMOCKED *******
describe('loginUserModel', () => {
	// Testfall: Das Passwort ist nicht korrekt
	it('sollte Null zurückgeben wenn das Passwort nicht korrekt ist', async () => {
		// Aufrufen der zu testenden Funktion
		const result = await loginUserModel(
			'user1@example.com',
			'wrongPassword'
		);

		// Überprüfen des Ergebnisses
		expect(result).toBeNull();
	});

	// Testfall: Das Passwort ist korrekt
	it('sollte den User zurückgeben wenn das Passwort korrekt ist', async () => {
		// Aufrufen der zu testenden Funktion
		const result = await loginUserModel(
			'user1@example.com',
			'hashedPassword'
		);

		// Überprüfen des Ergebnisses (Das Passwort wird nicht überprüft, da es gehasht ist und wir nicht wissen, wie der Hash aussieht)
		expect(result.user).toEqual(
			expect.objectContaining({
				id: mockUser.id,
				name: mockUser.name,
				email: mockUser.email,
			})
		);
	});
});
