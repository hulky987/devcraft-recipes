'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import { sendUserData } from '../utils/api';
import { useEffect, useState } from 'react';

export default function Login() {
	const { data: session } = useSession();

	useEffect(() => {
		if (session) {
			sendUserData(session);
			// Ensure this code is only executed on the client
			if (
				typeof window !== 'undefined' &&
				window.location.pathname !== '/'
			) {
				window.location.href = '/';
			}
		}
	}, [session]);

	if (session) {
		return (
			<div>
				Signed in as {session.user.email} <br />
				<button
					className='group underline rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30'
					onClick={() => signOut()}
				>
					Sign out
				</button>
			</div>
		);
	}
	return (
		<>
			<div className='flex flex-col gap-8 '>
				<div className='text-center'>
					<button
						className='group underline rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30'
						onClick={async () => await signIn('github')}
					>
						Sign in with Github
					</button>
				</div>
			</div>
		</>
	);
}
