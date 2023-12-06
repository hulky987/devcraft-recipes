

const fs = require('fs');
const path = require('path');


/* const data = fs.readFile(path.join(__dirname, '../mockDB.json'), 'utf8', (err, data) => {
    //console.log(data);
}) 
 */
exports.signupUserModel = async (name, email, password) => {

    try {
        const data = await new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname, '../mockDB.json'), 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

        const users = JSON.parse(data).user;

        let emailExists = false;
        
        for (const user of users) {
            if(user.email === email) {
                emailExists = true;
                break;
            }
        }
       
        if (emailExists) {
            return null;
        } else {
            console.log("User kann angelegt werden!");
            return {name, email, password};
        }
    } catch (error) {
        console.error("Fehler beim Lesen der Datei:", error);
    }

}