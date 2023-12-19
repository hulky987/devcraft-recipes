'use client';
import Link from 'next/link';
import axios from 'axios';
import { useState, useEffect } from 'react';

export default function Home() {
	const [recipes, setRecipes] = useState(null);

	useEffect(() => {
		// Get recipes from API with axios
		async function getRecipes() {
			const response = await axios.get('http://localhost:5000/recipes');
			console.log('[Home] response.data: ', response.data);
			if (Array.isArray(response.data.recipes.recipes)) {
				setRecipes(response.data.recipes.recipes);
			} else {
				console.error(
					'response.data.recipes is not an array:',
					response.data.recipes
				);
			}
		}
		getRecipes();
	}, []);

	return !recipes ? (
		<div>loading...</div>
	) : (
		<div>
			<ul>
				{recipes.map((recipe, index) => (
					<li key={index}>
						<Link href={`/recipes/${recipe.id}`}>
							{recipe.name}
							{recipe.description}
							{recipe.Steps}
							{recipe.ingredients}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
