// ******* Reiner Github Proider funktioniert ********
import NextAuth from 'next-auth/next';
import GithubProvider from 'next-auth/providers/github';

export const authOptions = {
	providers: [
		GithubProvider({
			clientId: process.env.GITHUB_ID ?? '',
			clientSecret: process.env.GITHUB_SECRET ?? '',
		}),
	],
};

export const authHandler = NextAuth(authOptions);

export { authHandler as GET, authHandler as POST };

// import NextAuth from 'next-auth/next';
// import GithubProvider from 'next-auth/providers/github';
// import axios from 'axios'; // Für HTTP-Anfragen

// export const authOptions = {
// 	providers: [
// 		GithubProvider({
// 			clientId: process.env.GITHUB_ID ?? '',
// 			clientSecret: process.env.GITHUB_SECRET ?? '',
// 		}),
// 	],
// 	callbacks: {
// 		async signIn(user, account, profile) {
// 			if (account.provider === 'github') {
// 				try {
// 					const response = await axios.post(
// 						'http://localhost:5000/auth/signup',
// 						{
// 							name: user.name,
// 							email: user.email,
// 							token: account.accessToken, // Sicherheitstoken
// 						}
// 					);

// 					if (response.status === 200) {
// 						return true; // Anmeldung erfolgreich
// 					} else {
// 						return false; // Anmeldung fehlgeschlagen
// 					}
// 				} catch (error) {
// 					console.error(error);
// 					return false; // Anmeldung fehlgeschlagen
// 				}
// 			}
// 		},
// 	},
// };

// export const authHandler = NextAuth(authOptions);

// export { authHandler as GET, authHandler as POST };
