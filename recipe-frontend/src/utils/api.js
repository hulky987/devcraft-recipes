import axios from 'axios';
import Cookies from 'js-cookie';

// Funktion, die ein User Objekts in den Local Storage und einen Token als Cookie setzt:
export const setSession = (user, token) => {
	try {
		localStorage.setItem('user', JSON.stringify(user));
		Cookies.set('token', token, { expires: 1 });
	} catch (error) {
		console.error('Error setting session:', error);
	}
};

// Funktion, die die Session Daten aus dem Local Storage und dem Cookie empfängt:
export const getSession = () => {
	try {
		const user = JSON.parse(localStorage.getItem('user'));
		const token = Cookies.get('token') || null;
		return { user, token };
	} catch (error) {
		console.error('Error getting session:', error);
	}
};

// Funktion, die die Session Daten aus dem Local Storage und dem Cookie löscht:
export const deleteSession = () => {
	try {
		localStorage.removeItem('user') || null;
		Cookies.remove('token');
	} catch (error) {
		console.error('Error deleting session:', error);
	}
};

// Axios Interceptor, der bei jedem Request den Token aus dem Cookie holt und in den Header setzt:
axios.interceptors.request.use(
	(config) => {
		const { token } = getSession();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Funktion um die User Daten aus einer Session empfängt und an einen externen Express Server schickt:
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
