const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 10;

console.log('NODE_ENV:', process.env.NODE_ENV);

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// getUserJson = () => {
// 	return new Promise((resolve, reject) => {
// 		fs.readFile(
// 			path.join(__dirname, '../mockDB.json'),
// 			'utf8',
// 			(err, data) => {
// 				if (err) {
// 					reject(err);
// 				} else {
// 					resolve(data);
// 				}
// 			}
// 		);
// 	});
// };

// signupUserModel = async (name, email, password, loginMethod) => {
// 	console.log(
// 		'[userModel.js] signupUserModel: ',
// 		name,
// 		email,
// 		password,
// 		loginMethod
// 	);
// 	try {
// 		// Lese die Daten aus der mockDB.json Datei
// 		const data = await getUserJson();

// 		// Parse die Benutzer aus den gelesenen Daten
// 		const userArrays = await JSON.parse(data);

// 		let emailExists = false;

// 		// Merge localUser und githubUser arrays
// 		const allUsers = [...userArrays.user, ...userArrays.githubUser];

// 		// Durchlaufe alle Benutzer
// 		for (const user of allUsers) {
// 			// Wenn die E-Mail des Benutzers mit der eingegebenen E-Mail übereinstimmt
// 			if (user.email === email) {
// 				emailExists = true;
// 				break;
// 			}
// 		}

// 		// Wenn die E-Mail bereits existiert, gib null zurück
// 		if (emailExists) {
// 			console.log('User existiert bereits!');
// 			return null;
// 		} else {
// 			console.log('User wird angelegt!');

// 			let localUserid = userArrays.user.length + 1;
// 			let githubUserid = userArrays.githubUser.length + 1;

// 			// Hashe das Passwort, bevor es in der Datenbank gespeichert wird
// 			const hashedPassword = await bcrypt.hash(password, saltRounds);

// 			const isGithubUser = loginMethod === 'github';

// 			// Erstelle ein neues Benutzerobjekt
// 			let newUser = {
// 				id: isGithubUser ? githubUserid : localUserid,
// 				name: name,
// 				email: email,
// 				password: hashedPassword,
// 				loginMethod: loginMethod,
// 			};

// 			// Füge den neuen Benutzer zur Benutzerliste hinzu
// 			isGithubUser
// 				? userArrays.githubUser.push(newUser)
// 				: userArrays.user.push(newUser);

// 			// Speichere den neuen Benutzer in der mockDB.json Datei
// 			new Promise((resolve, reject) => {
// 				fs.writeFile(
// 					path.join(__dirname, '../mockDB.json'),
// 					JSON.stringify(userArrays, null, 2),
// 					(err) => {
// 						if (err) {
// 							reject(err);
// 						} else {
// 							resolve();
// 						}
// 					}
// 				);
// 			})
// 				.then(() => {
// 					console.log('Neuer User wurde erfolgreich angelegt!');
// 				})
// 				.catch((err) => {
// 					console.error(
// 						'Fehler beim Schreiben der Datei aufgetreten:',
// 						err
// 					);
// 				});

// 			// Gib das neue Benutzerobjekt zurück
// 			return { name, email, password: hashedPassword };
// 		}
// 	} catch (error) {
// 		console.error('Fehler beim Lesen der Datei:', error);
// 	}
// };

signupUserModel = async (name, email, password, loginMethod) => {
	// Wenn die loginMethod github ist, schreibe den Benutzer in die githubUser Tabelle
	const isGithubUser = loginMethod === 'github';

	if (isGithubUser) {
		const existingUser = await prisma.userGithub.findFirst({
			where: {
				OR: [{ name: name }, { email: email }],
			},
		});
		if (existingUser) {
			return {
				data: {
					name: existingUser.name,
					email: existingUser.email,
					loginMethod: 'github',
				},
			};
		} else {
			// Hashe das Passwort, bevor es in der Datenbank gespeichert wird
			const hashedPassword = await bcrypt.hash(password, saltRounds);

			return prisma.userGithub.create({
				data: {
					name,
					email,
					password: hashedPassword,
				},
			});
		}
	}

	const existingUser = await prisma.UserLocal.findFirst({
		where: {
			OR: [{ name: name }, { email: email }],
		},
	});
	if (existingUser) {
		return null;
	}

	// Hashe das Passwort, bevor es in der Datenbank gespeichert wird
	const hashedPassword = await bcrypt.hash(password, saltRounds);

	return prisma.UserLocal.create({
		data: {
			name,
			email,
			password: hashedPassword,
		},
	});
};

// loginUserModel = async (email, password) => {
// 	try {
// 		// Lese die Daten aus der mockDB.json Datei
// 		const data = await getUserJson();

// 		// Parse die Benutzer aus den gelesenen Daten
// 		const users = JSON.parse(data).user;

// 		// Durchlaufe alle Benutzer
// 		for (const user of users) {
// 			// Wenn die E-Mail des Benutzers mit der eingegebenen E-Mail übereinstimmt
// 			if (user.email === email) {
// 				// Vergleiche das eingegebene Passwort mit dem gehashten Passwort in der Datenbank
// 				const validPassword = await bcrypt.compare(
// 					password,
// 					user.password
// 				);

// 				// Wenn das Passwort korrekt ist
// 				if (validPassword) {
// 					// Gib das Benutzerobjekt zurück
// 					return user;
// 				} else {
// 					// Wenn das Passwort falsch ist, gib null zurück
// 					return null;
// 				}
// 			}
// 		}

// 		// Wenn die E-Mail nicht gefunden wird, gib null zurück
// 		return null;
// 	} catch (error) {
// 		console.error('Fehler beim Lesen der Datei:', error);
// 	}
// };

loginUserModel = async (email, password) => {
	// console.log('[loginUserModel] function called');
	const user = await prisma.UserLocal.findFirst({
		where: { email: email },
	});
	// console.log(
	// 	'[loginUserModel] user after prisma.UserLocal.findFirst: ',
	// 	user
	// );
	if (!user) {
		return null;
	}

	const isPasswordValid = bcrypt.compareSync(password, user.password);
	// console.log(
	// 	'[loginUserModel] isPasswordValid after bcrypt.compareSync: ',
	// 	isPasswordValid
	// );
	if (!isPasswordValid) {
		return null;
	}

	return { user };
};

module.exports = { loginUserModel, signupUserModel };
