import { supabase } from "./supabase"

export async function getRecipeFromChefClaude(
  ingredientsArr,
  servings = 2,
  preferences = { maxTime: "", diet: "", avoid: "" },
) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  const response = await fetch("/.netlify/functions/get-recipe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ingredients: ingredientsArr,
      servings,
      preferences,
    }),
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(result.error || "Failed to get recipe")
  }

    return { recipe: result.recipe, used: result.used, limit: result.limit }
}