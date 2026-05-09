using System;

class Calculator
{
    static void Main()
    {
        Console.WriteLine("=== Basic Calculator ===\n");

        while (true)
        {
            Console.WriteLine("\nSelect an operation:");
            Console.WriteLine("1. Add");
            Console.WriteLine("2. Subtract");
            Console.WriteLine("3. Multiply");
            Console.WriteLine("4. Divide");
            Console.WriteLine("5. Exit");
            Console.Write("\nEnter your choice (1-5): ");

            string choice = Console.ReadLine() ?? "";

            if (choice == "5")
            {
                Console.WriteLine("Thank you for using the calculator!");
                break;
            }

            if (choice is not ("1" or "2" or "3" or "4"))
            {
                Console.WriteLine("Invalid choice. Please try again.");
                continue;
            }

            Console.Write("Enter first number: ");
            if (!double.TryParse(Console.ReadLine(), out double num1))
            {
                Console.WriteLine("Invalid input. Please enter a valid number.");
                continue;
            }

            Console.Write("Enter second number: ");
            if (!double.TryParse(Console.ReadLine(), out double num2))
            {
                Console.WriteLine("Invalid input. Please enter a valid number.");
                continue;
            }

            double result = 0;
            bool validOperation = true;

            switch (choice)
            {
                case "1":
                    result = Add(num1, num2);
                    Console.WriteLine($"\nResult: {num1} + {num2} = {result}");
                    break;
                case "2":
                    result = Subtract(num1, num2);
                    Console.WriteLine($"\nResult: {num1} - {num2} = {result}");
                    break;
                case "3":
                    result = Multiply(num1, num2);
                    Console.WriteLine($"\nResult: {num1} * {num2} = {result}");
                    break;
                case "4":
                    if (num2 == 0)
                    {
                        Console.WriteLine("\nError: Cannot divide by zero.");
                        validOperation = false;
                    }
                    else
                    {
                        result = Divide(num1, num2);
                        Console.WriteLine($"\nResult: {num1} / {num2} = {result}");
                    }
                    break;               
            }
            
        }
    }

    static double Add(double a, double b) => a + b;
    static double Subtract(double a, double b) => a - b;
    static double Multiply(double a, double b) => a * b;
    static double Divide(double a, double b) => a / b;
}
