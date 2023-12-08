'use client';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { sendUserData } from '../utils/api';

export function NavBar() {
	const { data: session } = useSession();
	// console.log('[NavBar] session: ', session);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
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

	if (!isClient) {
		return null;
	}

	if (session) {
		return (
			<nav className='flex flex-row justify-between h-[60px] w-1/2 mb-32 items-center'>
				<Link href={'/'}>Home</Link>
				<div className={'flex flex-row gap-8 items-center'}>
					<div className='flex flex-row gap-2 justify-center items-center'>
						<img
							className={'w-[30px] h-[30px] rounded-[50%] '}
							alt={'Profilbild'}
							src={session.user.image}
						/>
						<span>{session.user.name}</span>
					</div>
					<button
						onClick={() => {
							signOut();
						}}
					>
						Sign out
					</button>
				</div>
			</nav>
		);
	}
	return (
		<nav className='flex flex-row justify-between h-[60px] w-1/2 mb-32 items-center'>
			<Link href={'/'}>Home</Link>
			<div className={'flex flex-row gap-8 items-center'}>
				<Link href={'/signup'}>SignUp</Link>
				<Link href={'/login'}>LogIn</Link>
			</div>
		</nav>
	);
}
