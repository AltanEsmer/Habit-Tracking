using System;
namespace RecipeManagementSystem
{
    class Program
    {
        public static void Main()
        {
            RecipeManager manager = new();
            JsonRecipeStorage storage = new();
            Console.Clear();
            System.Console.WriteLine("Recipe Management System\n");
            bool exit = true;
            while (exit)
            {
                System.Console.WriteLine("Options:");
                System.Console.WriteLine("1. Add Recipe");
                System.Console.WriteLine("2. Update Recipe");
                System.Console.WriteLine("3. Categorize Recipe");
                System.Console.WriteLine("4. View Recipes");
                System.Console.WriteLine("5. Load Recipes");
                System.Console.WriteLine("6. Save Data - (json file)");
                System.Console.WriteLine("7. Exit");
                System.Console.Write("\nEnter option: ");
                if (!int.TryParse(Console.ReadLine(), out int option))
                {
                    System.Console.WriteLine("Invalid data entry, try again.");
                    continue;
                }
                switch (option)
                {
                    case 1:
                        manager.AddRecipe();
                        break;
                    case 2:
                        manager.UpdateRecipe();
                        break;
                    case 3:
                        manager.CategorizedRecipe();
                        break;
                    case 4:
                        manager.ViewRecipe();
                        break;
                    case 5:
                        storage.LoadRecipes();
                        break;
                    case 6:
                        storage.SaveRecipes(manager.recipes);
                        break;
                    case 7:
                        System.Console.WriteLine("Have a good day!");
                        exit = false;
                        break;
                    default: 
                        System.Console.WriteLine("Invalid choice, try again.");
                        break;
                }
            }
        }
    }
}