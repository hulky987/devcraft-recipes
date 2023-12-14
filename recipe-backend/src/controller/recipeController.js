const {createRecipeModel, getAllRecipesModel,getRecipeByIdModel, deleteRecipeModel, updateRecipeModel} = require("../models/recipeModel");

function checkIfIngredientsIsArrayOfObjectWithRequiredFields(ingredients) {
    console.log('[recipeController.js] checkIfIngredientsIsArrayOfObjectWithRequiredFields: ', ingredients)
    // check if ingredients is an array
    if (!Array.isArray(ingredients)) {
        throw new Error('ingredients have to be an array.');
    }
    // check if array is empty
    if (ingredients.length === 0) {
        throw new Error('ingredients have to contain at least one element.');
    }
    // check if every element is an object
    if (!ingredients.every(item => typeof item === 'object')) {
        throw new Error('ingredients have to contain only objects.');
    }
    // check if every object has the required fields
    const requiredFields = ['amount', 'unit', 'name']; // Ersetze dies durch die tatsächlich erforderlichen Felder
    if (!ingredients.every(item => requiredFields.every(feld => feld in item))) {
        throw new Error('ingredients have to contain the required fields.');
    }
    return true;
}

exports.createRecipe = async (req, res) => {
    console.log('[recipeController.js] createRecipe: ', req.body)
    try {
        const {
            name,
            description,
            steps,
            cookingTime,
            userId,
            ingredients,
        } = req.body;

        //Check if required fields are given
        if (!name || !ingredients || !steps ) {
            return res
                .status(400)
                .json({ message: 'Need name, steps, and ingredients for creating a recipe ' });
        }

        //check if ingredients is an array of objects with required fields
        if(!checkIfIngredientsIsArrayOfObjectWithRequiredFields(ingredients)){
            return res
                .status(400)
                .json({ message: 'ingredients have to be an array of objects with fields: amount,unit, name' });
        }

        //creating recipe
        const recipe = await createRecipeModel(name, steps, description, cookingTime, userId, ingredients);

        if (!recipe) {
            return res.status(409).json({
                message: 'Recipe could not be created!',
            });
        }

        console.log('[recipeController.js] back from Model: ', recipe);

        //return recipe
        res.status(201).json({
            message: 'recipe was created successfully!',
          recipe: recipe,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error!' });
    }
};

exports.deleteRecipe = async (req, res) => {
    console.log('[recipeController.js] deleteRecipe: ', req)
    try {
      const { id } = req.params.id

        const response = await deleteRecipeModel(id);
        console.log('[recipeController] response: ', response);

        if (!response) {
            return res.status(401).json({
                message: 'Recipe could not be deleted!',
            });
        }

        res.status(200).json({
            message: 'Recipe was deleted successfully!',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error!' });
    }
};

exports.updateRecipe = async (req, res) => {
    console.log('[recipeController.js] updateRecipe: ', req.body)
    try {

        const { id } = req.params.id

        const {
            name,
            description,
            steps,
            cookingTime,
            userId,
            ingredients,
        } = req.body;

        //Check if required fields are given
        if (!id ) {
            return res
                .status(404)
                .json({ message: 'can not find recipe' });
        }

        //check if ingredients is an array of objects with required fields
        if(ingredients && !checkIfIngredientsIsArrayOfObjectWithRequiredFields(ingredients)){
            return res
                .status(400)
                .json({ message: 'ingredients have to be an array of objects with fields: amount,unit, name' });
        }

        //updating
        const updatedRecipe = await updateRecipeModel(id,name, steps, description, cookingTime, userId, ingredients);

        if (!updatedRecipe) {
            return res.status(409).json({
                message: 'Recipe could not be updated!',
            });
        }

        console.log('[recipeController] back from Model: ', updatedRecipe);

        //return recipe
        res.status(201).json({
            message: 'recipe was updated successfully!',
            recipe: updatedRecipe,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error!' });
    }
};

exports.getAllRecipes = async (req, res) => {
    console.log('[recipeController.js] getAllRecipes: ', req)
    try {

        const allRecipes = await getAllRecipesModel();

        console.log('[authController] response: ', allRecipes);

        if (!allRecipes) {
            return res.status(401).json({
                message: 'No recipes found!',
            });
        }

        res.status(200).json({
            message: 'Recipes were found successfully!',
            recipes:allRecipes
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error!' });
    }
};

exports.getRecipeById = async (req, res) => {
    console.log('[recipeController.js] getRecipeById: ', req)
    try {
        const { id } = req.params.id

        const recipe = await getRecipeByIdModel(id);

        console.log('[recipeController] response: ', recipe);

        if (!recipe) {
            return res.status(404).json({
                message: 'No recipe found!',
            });
        }

        res.status(200).json({
            message: 'Recipe was found successfully!',
            recipe:recipe
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error!' });
    }

}
