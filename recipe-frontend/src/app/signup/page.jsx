'use client';

import { useState } from 'react';
import axios from 'axios';
import Login from '../../components/Login';
import { setSession } from '../../utils/api';

function SignupForm() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();

		const response = await axios.post('http://localhost:5000/auth/signup', {
			name,
			email,
			password,
			confirmPassword,
			loginMethod: 'local',
		});
		console.log('[SignupForm] response.data:', response.data);

		if (response.data.token) {
			try {
				// Setzen der Session Daten
				setSession(response.data.newUser, response.data.token);
				// Weiterleiten zu Home
			} catch (error) {
				console.error('Error setting session:', error);
			}
			// Weiterleiten zu Home
		} else {
			// Fehlermeldung anzeigen
		}
	};

	return (
		<>
			<form
				onSubmit={handleSubmit}
				className='border-2 border-gray-300 px-10 py-5 bg-gray-100'
			>
				<div className='flex flex-col gap-2'>
					<label className='flex flex-col'>
						Name:
						<input
							type='text'
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder='Your Name:'
							required
						/>
					</label>
					<label className='flex flex-col'>
						Email:
						<input
							type='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder='Your Email:'
							required
						/>
					</label>
					<label className='flex flex-col'>
						Password:
						<input
							type='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder='Your Password:'
							required
						/>
					</label>
					<label className='flex flex-col'>
						Confirm Password:
						<input
							type='password'
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder='Confirm Password:'
							required
						/>
					</label>
					<button
						type='submit'
						className='group underline rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30'
					>
						Sign Up
					</button>
				</div>
			</form>
			<Login />
		</>
	);
}

export default SignupForm;
