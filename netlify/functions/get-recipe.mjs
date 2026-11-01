import Anthropic from "@anthropic-ai/sdk"

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients. Format your response in markdown to make it easier to render to a web page.

At the end of every recipe, include a "Nutritional Information (per serving)" section with the following details:
- Calories
- Protein
- Carbohydrates
- Net Carbohydrates
- Fat
- Saturated Fat
- Fiber
- Sodium
- Cholesterol

These should be approximate values based on the recipe ingredients.
`

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

function buildPreferenceText(servings, preferences) {
    const lines = [`Make it for ${servings} servings.`]

    if (preferences.maxTime) {
        lines.push(`The total cooking time must be ${preferences.maxTime} minutes or less.`)
    }
    if (preferences.diet) {
        lines.push(`The recipe must be ${preferences.diet}.`)
    }
    if (preferences.avoid && preferences.avoid.trim()) {
        lines.push(`Do not use any of these ingredients: ${preferences.avoid}.`)
    }

    return lines.join(" ")
}

export default async (req) => {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 })
    }

    try {
        const body = await req.json()

        // basic checks so nobody can send huge or strange requests
        if (!Array.isArray(body.ingredients) || body.ingredients.length === 0 || body.ingredients.length > 30) {
            return Response.json({ error: "Invalid ingredients" }, { status: 400 })
        }

        const ingredients = body.ingredients
            .map(item => String(item).slice(0, 50))
            .join(", ")

        const servings = Math.min(12, Math.max(1, Number(body.servings) || 2))

        const preferences = {
            maxTime: String(body.preferences?.maxTime || "").slice(0, 3),
            diet: String(body.preferences?.diet || "").slice(0, 30),
            avoid: String(body.preferences?.avoid || "").slice(0, 100),
        }

        const preferenceText = buildPreferenceText(servings, preferences)

        const msg = await anthropic.messages.create({
            model: "claude-haiku-5-5",
            max_tokens: 4000,
            system: SYSTEM_PROMPT,
            messages: [
                {
                    role: "user",
                    content: `I have ${ingredients}. ${preferenceText} Please give me a recipe you'd recommend I make!`,
                },
            ],
        })

        const textBlock = msg.content.find(block => block.type === "text")

        if (!textBlock) {
            return Response.json({ error: "No recipe returned" }, { status: 502 })
        }

        return Response.json({ recipe: textBlock.text })
    } catch (err) {
        console.error(err)
        return Response.json({ error: "Something went wrong" }, { status: 500 })
    }
}