namespace RecipeManagementSystem
{
    public class Recipe
    {
        public Guid ID { get; set; } = Guid.NewGuid();
        public string? Title {get; set;}
        public List<string?> Ingredients {get; set;}
        public string? Instructions {get; set;}
        public string? Category {get; set;}

        public Recipe(string? title, List<string?> ingredients, string? instructions, string? category)
        {
            Title = title;
            Ingredients = ingredients;
            Instructions = instructions;
            Category = category;
        }
    }
}