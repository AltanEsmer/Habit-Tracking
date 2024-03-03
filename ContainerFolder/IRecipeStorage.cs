using System.Security.Cryptography.X509Certificates;
using System.Text.Json;

namespace RecipeManagementSystem
{
    interface IRecipeStorage
    {
        public List<Recipe> LoadRecipes();
        public void SaveRecipes(List<Recipe> recipes);
    }

    public class JsonRecipeStorage : IRecipeStorage
    {
        private const string directoryPath = "RecipeData";
        private const string fileName = "recipes.json";
        private readonly string filePath = Path.Combine(directoryPath, fileName);
        public JsonRecipeStorage()
        {
            InitializeDirectory();
        }
        
        private void InitializeDirectory()
        {
            if (!Directory.Exists(directoryPath))
            {
                Directory.CreateDirectory(directoryPath);
                System.Console.WriteLine($"Directory '{directoryPath}' created.");
            }
        }
        
        public List<Recipe> LoadRecipes()
        {
            try
            {
                if (File.Exists(filePath))
                {
                    string json = File.ReadAllText(filePath);
                    var loadedRecipes = JsonSerializer.Deserialize<List<Recipe>>(json);

                    if (loadedRecipes != null && loadedRecipes.Count > 0)
                    {
                        Console.WriteLine("Loaded Recipes:");
                        foreach (var recipe in loadedRecipes)
                        {
                            Console.WriteLine($"ID:{recipe.ID}, Title: {recipe.Title}, Ingredients: {recipe.Ingredients}, Instructions: {recipe.Instructions}, Category: {recipe.Category}");
                        }
                    }
                    else
                    {
                        Console.WriteLine("No recipes found in the file.");
                    }

                    return loadedRecipes ?? [];
                }
                else
                {
                    Console.WriteLine("No existing recipe file found. Creating a new one.");
                    return [];
                }
            }
            catch (IOException ex)
            {
                Console.WriteLine($"Error loading recipes from file: {ex.Message}");
                return [];
            }
        }

        public void SaveRecipes(List<Recipe> recipes)
        {
            try
            {
                string json = JsonSerializer.Serialize(recipes, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(filePath, json);
                Console.WriteLine("Recipes saved successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving recipes to file: {ex.Message}");
            }
        }
    }
}