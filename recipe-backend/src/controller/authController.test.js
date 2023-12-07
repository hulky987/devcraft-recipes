const {beforeAll,test,expect, describe, afterAll} = require('@jest/globals');
const {signupUser} = require('./authController');
const request = require('supertest');
const {app, start} = require('../app');




describe("signupUser", () => {

    let server
    const port = 3001

    beforeAll(() => {
        server = start(port)
    })

    afterAll(() => {
        server.close()
    })



    test("should return 400 if password is missing", async () => {

        const req = {
            body: {
                name: "User1",
                email: "user1@web.de"
            }}

     // const response = await signupUser(req, {})

        const response = await request(app).post('/auth/signup').send(req.body)

        expect(response.status).toBe(400);
    })})

