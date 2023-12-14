const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

async function createManyIngredients(ingredients, recipeId) {
    const ingredientsSafeForCreating = ingredients.map(ingredient => {
        return {
            name: ingredient.name ?? "",
            amount: ingredient.amount ?? "",
            unit: ingredient.unit ?? ""
        }
    })
    await ingredientsSafeForCreating.forEach(ingredient => {
        prisma.ingredient.create({
            data: {
                recipeId: recipeId,
                unit: ingredient.units,
                name: ingredient.name,
                amount: ingredient.amount,
            }
        })
    })

    return true

}

createRecipeModel = async (name, steps, description, cookingTime, userId, ingredients) => {

    const recipeWithoutIngredients = await prisma.recipe.create({
        data: {
            name,
            userId: userId,
            description: description ?? "",
            Steps: steps,
            cookingTime: cookingTime ?? 0,
        }
    })

    if (!recipeWithoutIngredients) return null
    await createManyIngredients(ingredients, recipeWithoutIngredients.id)

    const recipe = await prisma.recipe.findUnique({
        where: {
            id: recipeWithoutIngredients.id
        },
        include: {
            Ingredients: true
        }
    })

    if (!recipe) return null
    console.log("[RecipeModel] createRecipeModel: ", recipe)
    return recipe

};


getAllRecipesModel = async () => {
    const recipes = await prisma.recipe.findMany()

    if (!recipes) {
        return null;
    }
    console.log("[RecipeModel] getRecipeModel: ", recipes)

    return {recipes};
};

deleteRecipeModel = async (id) => {
    const response = await prisma.recipe.delete({
        where: {
            id
        }
    })
    console.log("[RecipeModel] deleteRecipeModel: ", response)
    return true
}

updateRecipeModel = async (id, userId, name, ingredients, cookingTime, steps, description) => {

    await prisma.ingredient.deleteMany({
        where: {
            recipeId: id
        }
    })

     await prisma.recipe.update({
        where: {
            id,
            userId
        },
        data: {
            name,
            description: description ?? "",
            cookingTime: cookingTime ?? 0,
            Steps: steps,
        }
    })

    await createManyIngredients(ingredients, id)

    const updatedRecipe = await prisma.recipe.findUnique({
        where: {
            id,
            userId
        },
        include: {
            Ingredients: true
        }
    })



    if (!updatedRecipe) return null
    console.log("[RecipeModel] updateRecipeModel: ", updatedRecipe)
    return updatedRecipe
}


getRecipeByIdModel = async (id) => {
    const recipe = await prisma.recipe.findUnique({
        where: {
            id
        }
    })
    console.log("[RecipeModel] getRecipeByIdModel: ", recipe)
    return recipe
}

module.exports = {getAllRecipesModel, createRecipeModel, deleteRecipeModel, updateRecipeModel, getRecipeByIdModel};
