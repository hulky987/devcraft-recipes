"use client"
import Link from 'next/link';
// import {NavBar} from "../components/NavBar";
import Login from "../components/Login";
import axios from "axios";
import {useState} from "react";

export default function Home() {
	const [recipes, setRecipes] = useState<[]>([])

	 axios.get("http://localhost:5000/recipes").then((response) => {
console.log(response.data)
setRecipes(response.data.recipes)
	})

	if(!recipes){
		return <div>loading...</div>
	}
	return (
		<div>
			<ul>
				{recipes.map((recipe, index) => {
					return (
						<li key={index}>
							<Link href={`/recipes/${recipe.id}`}>
								<a>{recipe.name}</a>
							</Link>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
