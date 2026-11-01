export async function getRecipeFromChefClaude(
  ingredientsArr,
  servings = 2,
  preferences = { maxTime: "", diet: "", avoid: "" },
) {
  const response = await fetch("/.netlify/functions/get-recipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ingredients: ingredientsArr,
      servings,
      preferences,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get recipe");
  }

  const data = await response.json();
  return data.recipe;
}