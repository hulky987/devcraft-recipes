const {signupUser, loginUser} = require('./authController');
const {signupUserModel, loginUserModel} = require('../models/userModel');
const jwt = require('jsonwebtoken');
const {log} = require('console');

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
        it('sollte 409 zurückgeben wenn schon ein user mit dieser email existiert', async () => {
            const req = {
                body: {
                    name: 'User1',
                    email: 'user1@example.com',
                    password: '123456'
                }
            };
            await signupUser(req, res);
            expect(res.json).toHaveBeenCalledWith({message: 'Es existiert bereits ein User mit dieser E-Mail!'});
            expect(res.status).toHaveBeenCalledWith(409);
        });

        it('sollte 201 zurückgeben wenn der USer erfolgreich erstellt wurrde', async () => {
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

        it('sollte 409 zurückgeben wenn der User bereits in Verwendung ist ', async () => {
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
        it('sollte 400 zurückgeben wenn nicht alle Eingaben vorhanden sind', async () => {
            await loginUser(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({message: 'Bitte alle Felder ausfüllen!'});
        });

        it('sollte 200 zurückgeben wenn der User erfolgreich eingeloggt wurde', async () => {
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
            expect(res.json).toHaveBeenCalledWith({
                message: 'User wurde erfolgreich eingeloggt!',
                token: 'token',
                user: {name: 'User1', email: 'user1@example.com'}
            });
        });
    });
});