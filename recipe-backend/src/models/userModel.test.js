const {
    test,
    expect,
    describe,
} = require('@jest/globals');
const {getUserJson, signupUserModel, loginUserModel} = require("./userModel");

describe('login if possible', () => {


   test("should get all users from DB",async ()=>{
       const data = await getUserJson();

       // Parse die Benutzer aus den gelesenen Daten
       const userArrays = JSON.parse(data);


       expect(userArrays).toBeDefined()

   })

    test('should return null if password is incorrect', async () => {
       const user ={
           email:"user1@web.de",
           password:"something^3"

        }

        const response = await loginUserModel(user.email,user.password)


        console.log("RESPONSE",response)
        expect(response).toBe(null);
    });

    test("should return user if user is successfully logged in", async () => {

        const data = await getUserJson()

        // Parse die Benutzer aus den gelesenen Daten
        const userArrays = JSON.parse(data);

        let userNameNumber = userArrays.user.length * 3;

        const user= {
                name: `user${userNameNumber}`,
                email: `user${userNameNumber}@web.de`,
                password:"123456",
                loginMethod: "local"
            }

        // const response = await request(app).post('/auth/signup').send(req.body);
        const response = await loginUserModel(user.email,user.password)

        expect(response).toBeDefined();
    })

    test("should return null if user is not defined",async ()=>{

        // Parse die Benutzer aus den gelesenen Daten


        const user= {
            email: `dasIstEinTestUser123456789@web.de`,
            password:"123456",
        }

        // const response = await request(app).post('/auth/signup').send(req.body);
        const response = await loginUserModel(user.email,user.password)

        expect(response).toBe(null);
    })



});
