import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@supabase/supabase-js"

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

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

const FREE_LIMIT = Number(process.env.FREE_RECIPE_LIMIT) || 5

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

    // 1. who is calling?
    const authHeader = req.headers.get("authorization") || ""
    const token = authHeader.replace("Bearer ", "")

    if (!token) {
        return Response.json({ error: "Please log in to get a recipe." }, { status: 401 })
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(token)

    if (userError || !userData.user) {
        return Response.json({ error: "Your session expired. Please log in again." }, { status: 401 })
    }

    const userId = userData.user.id

    try {
        // 2. check the request
        const body = await req.json()

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

        // 3. count this recipe, unless the user is out of free recipes
        const month = new Date().toISOString().slice(0, 7)

        const { data: usage, error: usageError } = await supabase.rpc("consume_recipe", {
            p_user: userId,
            p_month: month,
            p_limit: FREE_LIMIT,
        })

        if (usageError) {
            console.error(usageError)
            return Response.json({ error: "Something went wrong" }, { status: 500 })
        }

        if (!usage[0].allowed) {
            return Response.json(
                { error: `You've used all ${FREE_LIMIT} free recipes this month.` },
                { status: 429 }
            )
        }

        // 4. ask Claude
        try {
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
                throw new Error("No text returned")
            }

            return Response.json({ recipe: textBlock.text, used: usage[0].used, limit: FREE_LIMIT })
        } catch (claudeError) {
            // Claude failed, so give the recipe back
            console.error(claudeError)
            await supabase.rpc("refund_recipe", { p_user: userId, p_month: month })
            return Response.json({ error: "Something went wrong" }, { status: 502 })
        }
    } catch (err) {
        console.error(err)
        return Response.json({ error: "Something went wrong" }, { status: 500 })
    }
}