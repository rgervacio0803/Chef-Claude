import ReactMarkdown from "react-markdown";

export default function ClaudeRecipe(props) {
  function copyRecipe() {
    navigator.clipboard
      .writeText(props.recipe)
      .then(() => alert("Recipe copied to clipboard!"))
      .catch(() => alert("Failed to copy recipe"));
  }

  return (
    <section className="suggested-recipe-container" aria-live="polite">
      <div className="recipe-header">
        <h2>Chef Claude Recommends:</h2>
        <div className="recipe-buttons">
          <button className="copy-btn" onClick={copyRecipe}>
            📋 Copy Recipe
          </button>
          <button className="save-btn" onClick={props.saveRecipe}>
            ⭐ Save Recipe
          </button>
        </div>
      </div>
      <ReactMarkdown>{props.recipe}</ReactMarkdown>
    </section>
  );
}
