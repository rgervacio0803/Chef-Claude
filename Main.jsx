import React from "react";
import IngredientsList from "./components/IngredientsList";
import ClaudeRecipe from "./components/ClaudeRecipe";
import { getRecipeFromChefClaude, getRecipeFromMistral } from "./ai";
import ReactMarkdown from "react-markdown";

export default function Main() {
  const [ingredients, setIngredients] = React.useState([]);
  const [recipe, setRecipe] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [savedRecipes, setSavedRecipes] = React.useState(
    JSON.parse(localStorage.getItem("savedRecipes")) || [],
  );

  async function getRecipe() {
    setIsLoading(true);
    setError(null); // clear previous errors
    try {
      const recipeMarkdown = await getRecipeFromChefClaude(ingredients);
      setRecipe(recipeMarkdown);
    } catch (err) {
      console.error(err);
      setError("Something went wrong! Please try again.");
    } finally {
      setIsLoading(false); // always stop loading
    }
  }

  function addIngredient(formData) {
    const newIngredient = formData.get("ingredient");
    setIngredients((prevIngredients) => [...prevIngredients, newIngredient]);
  }

  function removeIngredient(ingredientToRemove) {
    setIngredients((prevIngredients) =>
      prevIngredients.filter((ingredient) => ingredient !== ingredientToRemove),
    );
  }

  function clearIngredients() {
    setIngredients([]);
  }

  function saveRecipe() {
    const newSavedRecipes = [...savedRecipes, recipe];
    setSavedRecipes(newSavedRecipes);
    localStorage.setItem("savedRecipes", JSON.stringify(newSavedRecipes));
    alert("Recipe saved!");
  }

  function deleteSavedRecipe(index) {
    const newSavedRecipes = savedRecipes.filter((_, i) => i !== index);
    setSavedRecipes(newSavedRecipes);
    localStorage.setItem("savedRecipes", JSON.stringify(newSavedRecipes));
  }

  return (
    <div>
      <section className="hero-section">
        <h2>What's in your kitchen?</h2>
        <p>
          Add your ingredients and let Chef Claude create a delicious recipe
          just for you!
        </p>
      </section>

      <main>
        <form action={addIngredient} className="add-ingredient-form">
          <input
            type="text"
            placeholder="e.g. oregano"
            aria-label="Add ingredient"
            name="ingredient"
          />
          <button>Add ingredient</button>
        </form>

        {ingredients.length > 0 && (
          <IngredientsList
            ingredients={ingredients}
            getRecipe={getRecipe}
            isLoading={isLoading}
            removeIngredient={removeIngredient}
            clearIngredients={clearIngredients}
          />
        )}
        {error && <p className="error-message">{error}</p>}
        {recipe && <ClaudeRecipe recipe={recipe} saveRecipe={saveRecipe} />}
        {savedRecipes.length > 0 && (
          <div className="saved-recipes">
            <h2>⭐ Saved Recipes</h2>
            {savedRecipes.map((savedRecipe, index) => (
              <div key={index} className="saved-recipe-item">
                {/* ✅ add recipe number as title */}
                <h3 className="saved-recipe-title">Recipe {index + 1}</h3>
                <ReactMarkdown>{savedRecipe}</ReactMarkdown>
                <button
                  className="delete-saved-btn"
                  onClick={() => deleteSavedRecipe(index)}
                >
                  🗑️ Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
