const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 10;

getUserJson=()=> {
	return new Promise((resolve, reject) => {
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
}


signupUserModel = async (name, email, password, loginMethod) => {
	console.log(
		'[userModel.js] signupUserModel: ',
		name,
		email,
		password,
		loginMethod
	);
	try {
		// Lese die Daten aus der mockDB.json Datei
		const data = await getUserJson();

		// Parse die Benutzer aus den gelesenen Daten
		const userArrays = await JSON.parse(data);

		let emailExists = false;

		// Merge localUser und githubUser arrays
		const allUsers = [...userArrays.user, ...userArrays.githubUser];

		// Durchlaufe alle Benutzer
		for (const user of allUsers) {
			// Wenn die E-Mail des Benutzers mit der eingegebenen E-Mail übereinstimmt
			if (user.email === email) {
				emailExists = true;
				break;
			}
		}

		// Wenn die E-Mail bereits existiert, gib null zurück
		if (emailExists) {
			console.log('User existiert bereits!');
			return null;
		} else {
			console.log('User wird angelegt!');

			let localUserid = userArrays.user.length + 1;
			let githubUserid = userArrays.githubUser.length + 1;

			// Hashe das Passwort, bevor es in der Datenbank gespeichert wird
			const hashedPassword = await bcrypt.hash(password, saltRounds);

			const isGithubUser = loginMethod === 'github';

			// Erstelle ein neues Benutzerobjekt
			let newUser = {
				id: isGithubUser ? githubUserid : localUserid,
				name: name,
				email: email,
				password: hashedPassword,
				loginMethod: loginMethod,
			};

			// Füge den neuen Benutzer zur Benutzerliste hinzu
			isGithubUser ? userArrays.githubUser.push(newUser) : userArrays.user.push(newUser);

			// Speichere den neuen Benutzer in der mockDB.json Datei
			new Promise((resolve, reject) => {
				fs.writeFile(
					path.join(__dirname, '../mockDB.json'),
					JSON.stringify(userArrays, null, 2),
					(err) => {
						if (err) {
							reject(err);
						} else {
							resolve();
						}
					}
				);
			})
				.then(() => {
					console.log('Neuer User wurde erfolgreich angelegt!');
				})
				.catch((err) => {
					console.error('Fehler beim Schreiben der Datei aufgetreten:', err);
				});

			// Gib das neue Benutzerobjekt zurück
			return { name, email, password: hashedPassword };
		}
	} catch (error) {
		console.error('Fehler beim Lesen der Datei:', error);
	}
};

loginUserModel = async (email, password) => {
	try {
		// Lese die Daten aus der mockDB.json Datei
		const data = await getUserJson();

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


module.exports = {getUserJson, loginUserModel, signupUserModel}