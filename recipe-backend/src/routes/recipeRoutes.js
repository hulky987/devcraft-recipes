const { createRecipe,deleteRecipe,getAllRecipes,getRecipeById,updateRecipe } = require('../controller/recipeController');

const express = require('express');

const router = express.Router();

router.get('/', getAllRecipes);

router.get('/:recipeId', getRecipeById);

router.post('/', createRecipe);

router.delete('/:recipeId', deleteRecipe);

router.put('/:recipeId', updateRecipe);

module.exports = router;
