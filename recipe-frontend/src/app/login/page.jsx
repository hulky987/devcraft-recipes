'use client';
import { useState } from 'react';
import axios from 'axios';
import { NavBar } from '../../components/NavBar';

function LoginForm() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	// console.log(name, email, password, confirmPassword);

	const handleSubmit = async (e) => {
		e.preventDefault();

		const response = await axios.post('http://localhost:5000/auth/login', {
			email: email,
			password: password,
		});
		console.log('[SignupForm] handleSubmit response: ', response);

		if (response.data.success) {
			// Weiterleiten zum Dashboard oder einer anderen Seite
		} else {
			// Fehlermeldung anzeigen
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='border-2 border-gray-300 px-10 py-5 bg-gray-100'
		>
			<div className='flex flex-col gap-2'>
				<label className='flex flex-col'>
					Email:
					<input
						type='email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder='Your Email:'
						// required
					/>
				</label>
				<label className='flex flex-col'>
					Password:
					<input
						type='password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder='Your Password:'
						// required
					/>
				</label>
				<button
					type='submit'
					className='group underline rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30'
				>
					Log In
				</button>
			</div>
		</form>
	);
}

export default LoginForm;
