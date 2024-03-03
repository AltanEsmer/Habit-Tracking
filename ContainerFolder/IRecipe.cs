namespace RecipeManagementSystem
{
    public interface IRecipe
    {
        public void AddRecipe();
        public void ViewRecipe();
        public void UpdateRecipe();
        public void CategorizedRecipe();
    }

    public class RecipeManager : IRecipe
    {
        public List<Recipe> recipes = new();
        public void AddRecipe()
        {
            System.Console.WriteLine("----- Add Recipe -----");
            Console.Write("Enter title: ");
            string? title = Console.ReadLine();
            Console.Write("Enter gradients (use comma seperation please): ");
            List<string?> ingredients = Console.ReadLine().Split(',').Select(i => i.Trim()).ToList();
            Console.Write("Enter instructions: ");
            string? instructions = Console.ReadLine();
            Console.Write("Ente category: ");
            string? category = Console.ReadLine();
            Recipe recipe = new(title, ingredients, instructions, category);
            recipes.Add(recipe);
            System.Console.WriteLine("Recipe added successfully.");
        }

        public void CategorizedRecipe()
        {
            System.Console.WriteLine("----- Categorize Recipe -----");
            Console.Write("Enter recipe ID to categorize: ");
            if (Guid.TryParse(Console.ReadLine(), out Guid recipeId))
            {
                Recipe recipe = recipes.FirstOrDefault(r => r.ID == recipeId);
                if (recipe != null)
                {
                    Console.Write($"Enter new category for recipe '{recipe.Title}': ");
                    string? newCategory = Console.ReadLine();
                    recipe.Category = newCategory;
                    System.Console.WriteLine("Recipe categorized successfully.");
                }
                else
                {
                    System.Console.WriteLine("Recipe not found.");
                }
            }
            else
            {
                System.Console.WriteLine("Invalid receipe ID format.");
            }

        }

        public void UpdateRecipe()
        {
            System.Console.WriteLine("----- Categorize Recipe -----");
            Console.Write("Enter recipe ID to categorize: ");
            if (Guid.TryParse(Console.ReadLine(), out Guid recipeId))
            {
                Recipe recipe = recipes.FirstOrDefault(r => r.ID == recipeId);
                if (recipe != null)
                {
                    Console.Write($"Enter new category for recipe '{recipe.Title}': ");
                    string? newCategory = Console.ReadLine();
                    recipe.Category = newCategory;
                    System.Console.WriteLine("Recipe categorized successfully.");
                }
                else
                {
                    System.Console.WriteLine("Recipe not found.");
                }
            }
            else
            {
                System.Console.WriteLine("Invalid recipe ID format.");
            }
            
        }

        public void ViewRecipe()
        {
            System.Console.WriteLine("----- View Recipe -----");
            Console.Write("Enter recipe ID to view: ");
            if (Guid.TryParse(Console.ReadLine(), out Guid recipeId))
            {
                Recipe recipe = recipes.FirstOrDefault(r => r.ID == recipeId);
                if (recipe != null)
                {
                    // Implement code to display recipe details
                    System.Console.WriteLine($"Recipe details for '{recipe.Title}':");
                    System.Console.WriteLine($"Ingredients: {string.Join(", ", recipe.Ingredients)}");
                    System.Console.WriteLine($"Instructions: {recipe.Instructions}");
                    System.Console.WriteLine($"Category: {recipe.Category}");
                }
                else
                {
                    System.Console.WriteLine("Recipe not found.");
                }
            }
            else
            {
                System.Console.WriteLine("Invalid recipe ID format.");
            }
        }
    }
}