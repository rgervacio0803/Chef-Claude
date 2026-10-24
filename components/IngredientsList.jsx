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
            <h2>Ingredients on hand:</h2>
            <ul className="ingredients-list" aria-live="polite">{ingredientsListItems}</ul>
            {props.ingredients.length > 3 && <div className="get-recipe-container">
                <div>
                    <h3>Ready for a recipe?</h3>
                    <p>Generate a recipe from your list of ingredients.</p>
                </div>
                <button 
                onClick={props.getRecipe}
                disabled={props.isLoading}
                >
                {props.isLoading ? "Getting recipe..." : "Get a recipe"}
                </button>
            </div>}
        </section>
    )
}