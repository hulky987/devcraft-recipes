/*
Dieser Code testet die loginUserModel Funktion. Es werden zwei Szenarien getestet:
eines, in dem das Passwort nicht korrekt ist, und eines, in dem das Passwort korrekt ist.
In beiden Fällen werden die bcrypt.compareSync und prisma.UserLocal.findFirst Funktionen gemockt,
um bestimmte Rückgabewerte zu simulieren.
*/

// Importieren der benötigten Funktionen und Module
const { expect, describe, it} = require('@jest/globals');
const { loginUserModel } = require('./userModel');

// Mocken der bcrypt Bibliothek, um die compareSync Funktion zu simulieren
jest.mock('bcrypt', () => ({
	compareSync: jest.fn(),
}));

// Mocken des Prisma Clients, um die Datenbankzugriffe zu simulieren
jest.mock('@prisma/client', () => {
	return {
		PrismaClient: jest.fn().mockImplementation(() => {
			return {
				UserLocal: {
					// Simulieren der findFirst Funktion, um einen User zurückzugeben
					findFirst: jest.fn().mockImplementation(() => {
						return {
							id: 1,
							email: 'user1@example.com',
							name: 'User 1',
							password:
								'$2b$10$heqiLWjm1EPSM/bSRmsZU.hpI606bBr3V4j3PCUfowk.DyZGJaCVu',
						};
					}),
				},
			};
		}),
	};
});

// Importieren der gemockten Module
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ******* MODEL TEST CONTROLLER UND DATABASE GEMOCKED *******
// Beschreibung des Testblocks
describe('loginUserModel', () => {
	// Testfall: Das Passwort ist nicht korrekt
	it('sollte Null zurückgeben wenn das Passwort nicht korrekt ist', async () => {
		// Simulieren der findFirst Funktion von Prisma um einen User zurückzugeben
		prisma.UserLocal.findFirst.mockResolvedValue({
			email: 'user1@example.com',
			password: 'hashedPassword',
		});

		// Simulieren der compareSync Funktion von bcrypt um false zurückzugeben
		bcrypt.compareSync.mockReturnValue(false);

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
		// Erstellen eines gemockten Users
		const mockUser = {
			id: 1,
			name: 'User 1',
			email: 'user1@example.com',
			password:
				'$2b$10$heqiLWjm1EPSM/bSRmsZU.hpI606bBr3V4j3PCUfowk.DyZGJaCVu',
		};
		// Simulieren der findFirst Funktion von Prisma um den gemockten User zurückzugeben
		prisma.UserLocal.findFirst.mockResolvedValue(mockUser);

		// Simulieren der compareSync Funktion von bcrypt um true zurückzugeben
		bcrypt.compareSync.mockReturnValue(true);

		// Aufrufen der zu testenden Funktion
		const result = await loginUserModel(
			'user1@example.com',
			'hashedPassword'
		);

		// Überprüfen des Ergebnisses
		expect(result).toEqual({ user: mockUser });
	});
});
