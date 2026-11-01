export default function IngredientsList(props) {
    const ingredientsListItems = props.ingredients.map(ingredient => (
        <li key={ingredient}>
            {ingredient}
            <button 
            onClick={() => props.removeIngredient(ingredient)}
            className="remove-ingredient"
        >
            X
        </button>
            </li>
    ))
    return (
        <section>
            <div className="ingredients-header">
                <h2 className="ingredients-list-title">Ingredients on hand:</h2>
                <button 
                    className="clear-btn"
                    onClick={props.clearIngredients}
                >
                    🗑️ Clear All
                </button>
            </div>
            <ul className="ingredients-list" aria-live="polite">{ingredientsListItems}</ul>
            {props.ingredients.length > 3 &&
    <>
        <details className="preferences">
            <summary>More preferences</summary>

            <div className="preferences-grid">
                <label>
                    Max cooking time
                    <select
                        value={props.preferences.maxTime}
                        onChange={(e) => props.updatePreference("maxTime", e.target.value)}
                    >
                        <option value="">No limit</option>
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">60 minutes</option>
                    </select>
                </label>

                <label>
                    Dietary preference
                    <select
                        value={props.preferences.diet}
                        onChange={(e) => props.updatePreference("diet", e.target.value)}
                    >
                        <option value="">None</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="vegan">Vegan</option>
                        <option value="gluten-free">Gluten-free</option>
                        <option value="dairy-free">Dairy-free</option>
                        <option value="low-carb">Low-carb</option>
                    </select>
                </label>

                <label>
                    Ingredients to avoid
                    <input
                        type="text"
                        placeholder="e.g. peanuts, mushrooms"
                        value={props.preferences.avoid}
                        onChange={(e) => props.updatePreference("avoid", e.target.value)}
                    />
                </label>
            </div>
        </details>

        <div className="get-recipe-container">
            <div>
                <h3>Ready for a recipe?</h3>
                <p>Generate a recipe from your list of ingredients.</p>
            </div>

            <div className="servings-adjuster">
                <span>Servings</span>
                <button onClick={() => props.setServings(prev => Math.max(1, prev - 1))}>−</button>
                <span className="servings-count">{props.servings}</span>
                <button onClick={() => props.setServings(prev => Math.min(12, prev + 1))}>+</button>
            </div>

            <button onClick={props.getRecipe} disabled={props.isLoading}>
                {props.isLoading ? "Getting recipe..." : "Get a recipe"}
            </button>
        </div>
    </>
}
        </section>
    )
}