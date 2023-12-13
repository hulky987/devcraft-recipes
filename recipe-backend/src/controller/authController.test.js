const { signupUser, loginUser } = require('./authController');
const { signupUserModel, loginUserModel } = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { log } = require('console');

jest.mock('../models/userModel');
jest.mock('jsonwebtoken');

signupUserModel.mockImplementation((name, email, password, loginMethod) => {
	if (email === 'user1@example.com') {
		// Wenn die E-Mail bereits existiert, geben Sie null zurück
		return null;
	}

	// Ansonsten erstellen Sie einen neuen Benutzer
	return {
		id: 1,
		name: name,
		email: email,
		password: password,
		loginMethod: loginMethod,
	};
});

loginUserModel.mockImplementation((email, password) => {
	if (email === 'user1@example.com' && password === '123456') {
		return {
			user: {
				id: 1,
				name: 'User1',
				email: 'user1@example.com'
			}

		};
	}

});

jwt.sign.mockReturnValue('token');

describe('authController', () => {
	let req, res;

	beforeEach(() => {
		req = {
			body: {},
		};
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
	});

	describe('signupUser', () => {
		it('should return 409 if mail is already in use', async () => {
			const req = {
				body: {
					name: 'User1',
					email: 'user1@example.com',
					password: '123456'
				}
			};
			await signupUser(req, res);
			expect(res.json).toHaveBeenCalledWith({ message: 'Es existiert bereits ein User mit dieser E-Mail!' });
			expect(res.status).toHaveBeenCalledWith(409);
		});

		it('should return 201 if user is successfully created', async () => {
			const req = {
				body: {
					name: 'User2',
					email: 'user2@example.com',
					password: '123456'
				}
			};
			await signupUser(req, res);
			expect(res.status).toHaveBeenCalledWith(201);

		});

		it('should return 409 if user is already in use ', async () => {
			const req = {
				body: {
					name: 'User1',
					email: 'user1@example.com',
					password: "123456"
				}
			};
			await signupUser(req, res);
			expect(res.status).toHaveBeenCalledWith(409);
		});
	});

	describe('loginUser', () => {
		it('should return 400 if not all fields are filled out', async () => {
			await loginUser(req, res);
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ message: 'Bitte alle Felder ausfüllen!' });
		});

		// Add more tests for loginUser here
		it('should return 200 if user logged in succesfully', async () => {
			const req = {
				body: {
					id: 1,
					name: 'User1',
					email: 'user1@example.com',
					password: '123456'
				}
			};
			await loginUser(req, res);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ message: 'User wurde erfolgreich eingeloggt!', token: 'token', user: { name: 'User1', email: 'user1@example.com' } });
		});
	});
});