const {
    createRecipeModel,
    getAllRecipesModel,
    getRecipeByIdModel,
    deleteRecipeModel,
    updateRecipeModel
} = require("../models/recipeModel");

function checkIfIngredientsIsArrayOfObjectWithRequiredFields(ingredients) {
    console.log('[recipeController.js] checkIfIngredientsIsArrayOfObjectWithRequiredFields: ', ingredients)
    // Ingredients soll ein Array sein
    if (!Array.isArray(ingredients)) {
        return false;
    }
    // Ingredients soll nicht leer sein
    if (ingredients.length === 0) {
        return false;
    }
    // Alle Elemente in Ingredients sollen Objekte sein
    if (!ingredients.every(item => typeof item === 'object')) {
        return false;
    }
    // Alle Objekte in Ingredients sollen die erforderlichen Felder haben
    const requiredFields = ['amount', 'unit', 'name'];
    if (!ingredients.every(item => requiredFields.every(feld => feld in item))) {
        return false;
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
        if (!name || !ingredients || !steps) {
            return res
                .status(400)
                .json({message: 'Name, steps, und ingredients werden benötigt zum erstellen'});
        }

        //Funktion checkIfIngredientsIsArrayOfObjectWithRequiredFields überprüft ob ingredients ein Array von Objekten ist
        if (!checkIfIngredientsIsArrayOfObjectWithRequiredFields(ingredients)) {
            return res
                .status(400)
                .json({message: 'Ingredients muss ein array aus Objekten mit den Feldern: amount,unit und name sein '});
        }

        //Rezept erstellen
        const recipe = await createRecipeModel(name, steps, description, cookingTime, userId, ingredients);

        if (!recipe) {
            return res.status(409).json({
                message: 'Rezept konnte nicht erstellt werden!',
            });
        }

        console.log('[recipeController.js] back from Model: ', recipe);

        //Erstelltes Rezept zurücksenden
        res.status(201).json({
            message: 'Rezept wurde erfolgreich erstellt!',
            recipe: recipe,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal Server Error!'});
    }
};

exports.deleteRecipe = async (req, res) => {
    try {
        const id = parseInt(req.params.recipeId);
        console.log('[recipeController.js] deleteRecipe: ', id)


        //Löschen vom Rezept im Model
        const response = await deleteRecipeModel(id);
        console.log('[recipeController] response: ', response);


        if (!response) {
            return res.status(401).json({
                message: 'Rezepte konnte nicht gelöscht werden',
            });
        }

        res.status(200).json({
            message: 'Rezept erfolgreich gelöscht',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal Server Error!'});
    }
};

exports.updateRecipe = async (req, res) => {
    console.log('[recipeController.js] updateRecipe: ', req.body)
    try {
        //Holen der id aus den Parametern
        const id = parseInt(req.params.recipeId);

        const {
            name,
            description,
            steps,
            cookingTime,
            userId,
            ingredients,
        } = req.body;

        //Überprüfung ob alle notwendigen Eingaben vorhanden sind
        if (!id) {
            return res
                .status(404)
                .json({message: 'Rezept konnte nicht gefunden werden'});
        }

        //Funktion checkIfIngredientsIsArrayOfObjectWithRequiredFields überprüft ob ingredients ein Array von Objekten ist
        if (ingredients && !checkIfIngredientsIsArrayOfObjectWithRequiredFields(ingredients)) {
            return res
                .status(400)
                .json({message: 'Ingredients muss ein array aus Objekten mit den Feldern: amount,unit und name sein '});
        }

        //Rezept wird aktualisiert
        const updatedRecipe = await updateRecipeModel(id, userId, name, ingredients, cookingTime, steps, description);

        if (!updatedRecipe) {
            return res.status(409).json({
                message: 'Rezept konnte nicht aktualisiert werden',
            });
        }

        console.log('[recipeController] back from Model: ', updatedRecipe);

        //aktualisiertes Rezept wird an den user zurückgegeben
        res.status(201).json({
            message: 'Rezept erfolgreich aktualisiert',
            recipe: updatedRecipe,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal Server Error!'});
    }
};

exports.getAllRecipes = async (req, res) => {
    try {
// Rezepte von der Datenbank holen
        const allRecipes = await getAllRecipesModel();

        console.log('[authController] response: ', allRecipes);


        if (!allRecipes) {
            return res.status(401).json({
                message: 'Kein Rezept gefunden',
            });
        }

        res.status(200).json({
            message: 'Rezepte wurden gefunden',
            recipes: allRecipes
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal Server Error!'});
    }
};

exports.getRecipeById = async (req, res) => {
    try {
        //Holen der id aus den Parametern
        const id = parseInt(req.params.recipeId);
        // Rezept asu der DB holen
        const recipe = await getRecipeByIdModel(id);

        console.log('[recipeController] response: ', recipe);

        if (!recipe) {
            return res.status(404).json({
                message: 'Kein Rezept gefunden',
            });
        }

        res.status(200).json({
            message: 'Rezept erfolgreich gefunden',
            recipe: recipe
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal Server Error!'});
    }

}
