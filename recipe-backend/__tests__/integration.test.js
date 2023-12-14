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


// ******* HILFSFUNKTIONEN *******
async function createUser() {
	const hashedPassword = await bcrypt.hash('12345', saltRounds);
	await prisma.userLocal.create({
		data: {
			name: 'User 1',
			email: 'user1@example.com',
			password: hashedPassword
		},
	});
}

async function createRecipe() {
	return await request(app).post('/recipes').send({
		name: "Rezept 1",
		description: "Beschreibung 1",
		steps: ["Schritt 1", "Schritt 2", "Schritt 3"],
		cookingTime: 30,
		userId: 1,
		ingredients: [
			{
				name: "Zutat 1",
				unit: "gr",
				amount: 200.0
			},
			{
				name: "Zutat 2",
				unit: "ml",
				amount: 150.0
			},
			{
				name: "Zutat 3",
				unit: "gr",
				amount: 100.0
			}
		]
	});
}

async function createAnyRecipes(number) {
	for (let i = 1; i <= number; i++) {
		await request(app).post('/recipes').send({
			name: `Rezept ${i}`,
			description: `Beschreibung ${i}`,
			steps: [`Schritt ${i}`, `Schritt ${i}`, `Schritt ${i}`],
			cookingTime: 30,
			userId: 1,
			ingredients: [
				{
					name: `Zutat ${i}`,
					unit: "gr",
					amount: 200.0
				},
				{
					name: `Zutat ${i}`,
					unit: "ml",
					amount: 150.0
				},
				{
					name: `Zutat ${i}`,
					unit: "gr",
					amount: 100.0
				}
			]
		});
	}
}


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
	await prisma.recipe.deleteMany(); // Löscht alle Rezept-Einträge
	await prisma.userLocal.deleteMany(); // Löscht alle User-Einträge
	// Setzt die Auto-Inkrementierung der ID zurück. Das geht nur mit einem rohen SQL-Befehl.
	await prisma.$executeRaw`ALTER SEQUENCE "UserLocal_id_seq" RESTART WITH 1`;
	await prisma.$executeRaw`ALTER SEQUENCE "Recipe_id_seq" RESTART WITH 1`;
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
		await createUser();

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
		await createUser();

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
		await createUser();

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

// ******* RECIPE INTEGRATION TEST *******
describe('POST /recipe', () => {
	// Eine neue Rezept erstellen:
	it('soll ein neues Rezept erstellen', async () => {
		// Erstelle einen Benutzer
		await createUser();

		// Erstelle ein neues Rezept
		const res = await createRecipe();

		expect(res.statusCode).toEqual(201);

		prisma.recipe.findMany().then((recipes) => {
			expect(recipes.length).toEqual(1);
			expect(recipes[0].name).toEqual('Rezept 1');
		});

	});

	// Eine neue Rezept erstellen, wenn ein Feld leer ist:
	it('soll einen Fehler zurückgeben, wenn ein Feld fehlt', async () => {
		const res = await request(app).post('/recipes').send({
			name: 'Rezept 1',
		});

		expect(res.statusCode).toEqual(400);
		expect(res.body).toEqual({
			message: 'Need name, steps, and ingredients for creating a recipe ',
		});
	});

	// Eine neue Rezept erstellen, wenn die Zutaten kein Array sind:
	it('soll einen Fehler zurückgeben, wenn die Zutaten kein Array sind', async () => {
		const res = await request(app).post('/recipes').send({
			name: 'Rezept 1',
			steps: ['Schritt 1', 'Schritt 2', 'Schritt 3'],
			ingredients: 'Zutat 1',
		});

		expect(res.statusCode).toEqual(400);
		expect(res.body).toEqual({
			message: 'ingredients have to be an array of objects with fields: amount,unit, name',
		});
	});

	// // Eine neue Rezept erstellen, wenn die Zutaten ein leeres Array sind:
	it('soll einen Fehler zurückgeben, wenn die Zutaten ein leeres Array sind', async () => {
		const res = await request(app).post('/recipes').send({
			name: 'Rezept 1',
			steps: ['Schritt 1', 'Schritt 2', 'Schritt 3'],
			ingredients: [],
		});

		expect(res.statusCode).toEqual(400);
		expect(res.body).toEqual({
			message: 'ingredients have to be an array of objects with fields: amount,unit, name',
		});
	});
});

describe('GET /recipes', () => {
	// Rezepte abrufen:
	it('soll alle Rezepte abrufen', async () => {
		// Erstelle einen Benutzer
		await createUser();

		// Erstelle mehrere Rezepte
		await createAnyRecipes(3);

		// Hole alle Rezepte
		const res = await request(app).get('/recipes').send();

		expect(res.statusCode).toEqual(200);
		prisma.recipe.findMany().then((recipes) => {
			expect(recipes.length).toEqual(3);
		});
	});

	// Ein Rezept abrufen:
	it('soll ein Rezept abrufen', async () => {
		// Erstelle einen Benutzer
		await createUser();

		// Erstelle ein neues Rezept
		await createAnyRecipes(3);

		// Hole das Rezept
		const res = await request(app).get('/recipes/2').send();

		expect(res.statusCode).toEqual(200);
		console.log('TEST RESULT: ', res.body);
		expect(res.body.recipe.name).toEqual('Rezept 2');
		
	});

	// Ein Rezept abrufen, wenn es nicht existiert:
	it('soll einen Fehler zurückgeben, wenn das Rezept nicht existiert', async () => {
		// Erstelle einen Benutzer
		await createUser();

		// Erstelle ein neues Rezept
		await createAnyRecipes(3);

		// Hole das Rezept
		const res = await request(app).get('/recipes/100').send();

		expect(res.statusCode).toEqual(404);
		expect(res.body).toEqual({
			message: 'No recipe found!'
		});
	});
});

describe('DELETE /recipes/:recipeId', () => {
		
	// Rezept löschen:
	it('soll ein Rezept löschen', async () => {
		// Erstelle einen Benutzer
		await createUser();

		// Erstelle ein neues Rezept
		await createRecipe();

		// Lösche das Rezept
		const res = await request(app).delete('/recipes/1').send();

		expect(res.statusCode).toEqual(200);

		prisma.recipe.findMany().then((recipes) => {
			expect(recipes.length).toEqual(0);
		});
	});
});

describe('PUT /recipes/:recipeId', () => {
	// Rezept aktualisieren:
	it('soll ein Rezept aktualisieren', async () => {
		// Erstelle einen Benutzer
		await createUser();

		// Erstelle ein neues Rezept
		await createRecipe();

		// Aktualisiere das Rezept
		const res = await request(app).put('/recipes/1').send({
			name: 'Rezept 100',
			description: 'Beschreibung 100',
			steps: ['Schritt 10', 'Schritt 20', 'Schritt 30'],
			cookingTime: 30,
			userId: 1,
			ingredients: [
				{
					name: 'Zutat 1',
					unit: 'gr',
					amount: 200.0,
				},
				{
					name: 'Zutat 2',
					unit: 'ml',
					amount: 150.0,
				},
				{
					name: 'Zutat 3',
					unit: 'gr',
					amount: 100.0,
				},
			],
		});

		expect(res.statusCode).toEqual(201);

		prisma.recipe.findMany().then((recipes) => {
			expect(recipes.length).toEqual(1);
			expect(recipes[0].name).toEqual('Rezept 100');
		});
	});

});







