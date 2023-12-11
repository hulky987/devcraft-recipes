const fs = require('fs');
const {
    beforeAll,
    test,
    expect,
    describe,
    afterAll,
} = require('@jest/globals');
// const { signupUser } = require('./authController');
const request = require('supertest');
// const { app, start } = require('../app');
const path = require('path');
const {getUserJson} = require("./userModel");

describe('login if possible', () => {
   // let server;
   // const port = 5001;

   // beforeAll(() => {
     //   server = start(port);
   // });

   // afterAll(() => {
    //    server.close();
  //  });

   test("should get all users from DB",async ()=>{
       const data = await getUserJson();

       // Parse die Benutzer aus den gelesenen Daten
       const userArrays = JSON.parse(data);


       expect(userArrays).toBeDefined()

   })


});
