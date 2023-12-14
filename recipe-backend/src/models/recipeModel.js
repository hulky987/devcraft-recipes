

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

createRecipeModel = async (name, steps,description,cookingTime,userId,ingredients) => {

    const recipe = await prisma.recipe.create({
        data:{
            name,
            description: description??"",
            Steps:steps,
            cookingTime:cookingTime??0,
            Ingredients:
                {
                    createMany:{
                        data:{
                            ingredients
                        }
                    }
                }
        }
    })

    if (!recipe) return null
    console.log("[RecipeModel] createRecipeModel: ",recipe)
    return recipe

};


getAllRecipesModel = async () => {
    const recipes = await prisma.recipe.findMany()

    if (!recipes) {
        return null;
    }
    console.log("[RecipeModel] getRecipeModel: ",recipes)

    return { recipes };
};

deleteRecipeModel= async (id)=>{
  const response = await prisma.recipe.delete({
        where:{
            id
        }
    })
    console.log("[RecipeModel] deleteRecipeModel: ",response)
    return true
}

updateRecipeModel=async (id,userId,name,ingredients,cookingTime,steps,description)=> {

    await prisma.ingredient.deleteMany({
        where: {
            recipeId: id
        }
    })

    const updatedRecipe = await prisma.recipe.update({
        where: {
            id,
            userId
        },
        data: {
            name,
            description: description ?? "",
            cookingTime: cookingTime ?? 0,
            Steps: steps,
            Ingredients: {
                createMany: {
                    data: {
                        ingredients
                    }
                }
            }
        }
    })


    if (!updatedRecipe) return null
    console.log("[RecipeModel] updateRecipeModel: ", updatedRecipe)
    return updatedRecipe
}


getRecipeByIdModel=async (id)=>{
    const recipe = await prisma.recipe.findUnique({
        where:{
            id
        }
    })
    console.log("[RecipeModel] getRecipeByIdModel: ",recipe)
    return recipe
}

module.exports = { getAllRecipesModel, createRecipeModel, deleteRecipeModel, updateRecipeModel,getRecipeByIdModel };
