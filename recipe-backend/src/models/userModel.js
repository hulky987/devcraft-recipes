const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// 	try {
// 		const data = await new Promise((resolve, reject) => {
// 			fs.readFile(
// 				path.join(__dirname, '../mockDB.json'),
// 				'utf8',
// 				(err, data) => {
// 					if (err) {
// 						reject(err);
// 					} else {
// 						resolve(data);
// 					}
// 				}
// 			);
// 		});

// 		const users = JSON.parse(data).user;

// 		let emailExists = false;

// 		for (const user of users) {
// 			if (user.email === email) {
// 				emailExists = true;
// 				break;
// 			}
// 		}

// 		if (emailExists) {
// 			return null;
// 		} else {
// 			console.log('User wird angelegt!');

// 			let id = users.length + 1;

// 			let newUser = {
// 				id: id,
// 				name: name,
// 				email: email,
// 				password: password,
// 			};

// 			users.push(newUser);

// 			// Save user to mockDB.json
// 			fs.writeFile(
// 				path.join(__dirname, '../mockDB.json'),
// 				JSON.stringify({ user: users }, null, 2),
// 				(err) => {
// 					if (err) {
// 						reject(err);
// 					} else {
// 						resolve();
// 					}
// 				}
// 			);
// 			return { name, email, password };
// 		}
// 	} catch (error) {
// 		console.error('Fehler beim Lesen der Datei:', error);
// 	}
// };

exports.signupUserModel = async (name, email, password) => {
	try {
		// Lese die Daten aus der mockDB.json Datei
		const data = await new Promise((resolve, reject) => {
			fs.readFile(
				path.join(__dirname, '../mockDB.json'),
				'utf8',
				(err, data) => {
					if (err) {
						reject(err);
					} else {
						resolve(data);
					}
				}
			);
		});

		// Parse die Benutzer aus den gelesenen Daten
		const users = JSON.parse(data).user;

		let emailExists = false;

		// Durchlaufe alle Benutzer
		for (const user of users) {
			// Wenn die E-Mail des Benutzers mit der eingegebenen E-Mail übereinstimmt
			if (user.email === email) {
				emailExists = true;
				break;
			}
		}

		// Wenn die E-Mail bereits existiert, gib null zurück
		if (emailExists) {
			return null;
		} else {
			console.log('User wird angelegt!');

			let id = users.length + 1;

			// Hashe das Passwort, bevor es in der Datenbank gespeichert wird
			const hashedPassword = await bcrypt.hash(password, saltRounds);

			// Erstelle ein neues Benutzerobjekt
			let newUser = {
				id: id,
				name: name,
				email: email,
				password: hashedPassword,
			};

			// Füge den neuen Benutzer zur Benutzerliste hinzu
			users.push(newUser);

			// Speichere den neuen Benutzer in der mockDB.json Datei
			fs.writeFile(
				path.join(__dirname, '../mockDB.json'),
				JSON.stringify({ user: users }, null, 2),
				(err) => {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				}
			);
			// Gib das neue Benutzerobjekt zurück
			return { name, email, password: hashedPassword };
		}
	} catch (error) {
		console.error('Fehler beim Lesen der Datei:', error);
	}
};

exports.loginUserModel = async (email, password) => {
	try {
		// Lese die Daten aus der mockDB.json Datei
		const data = await new Promise((resolve, reject) => {
			fs.readFile(
				path.join(__dirname, '../mockDB.json'),
				'utf8',
				(err, data) => {
					if (err) {
						reject(err);
					} else {
						resolve(data);
					}
				}
			);
		});

		// Parse die Benutzer aus den gelesenen Daten
		const users = JSON.parse(data).user;

		// Durchlaufe alle Benutzer
		for (const user of users) {
			// Wenn die E-Mail des Benutzers mit der eingegebenen E-Mail übereinstimmt
			if (user.email === email) {
				// Vergleiche das eingegebene Passwort mit dem gehashten Passwort in der Datenbank
				const validPassword = await bcrypt.compare(
					password,
					user.password
				);

				// Wenn das Passwort korrekt ist
				if (validPassword) {
					// Gib das Benutzerobjekt zurück
					return user;
				} else {
					// Wenn das Passwort falsch ist, gib null zurück
					return null;
				}
			}
		}

		// Wenn die E-Mail nicht gefunden wird, gib null zurück
		return null;
	} catch (error) {
		console.error('Fehler beim Lesen der Datei:', error);
	}
};
