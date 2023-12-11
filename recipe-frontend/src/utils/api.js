import axios from 'axios';

// Schreibe eine Funktion die User Daten aus einer Session empfängt und an einen externen Express Server schickt:
export const sendUserData = async (session) => {
	try {
		const response = await axios.post(`http://localhost:5000/auth/signup`, {
			name: session.user.name,
			email: session.user.email,
			loginMethod: 'github',
		});
		console.log('[sendUserData] response.data:', response.data);
	} catch (error) {
		console.error('[sendUserData] error:', error);
	}
};
