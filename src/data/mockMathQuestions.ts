export interface GmatMathQuestion {
  id: string;
  topic: 'algebra' | 'arithmetic' | 'word-problems' | 'number-properties' | 'rates-and-work' | 'ratios-and-percents' | 'statistics-and-data';
  difficulty: 'easy' | 'medium' | 'hard';
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  strategy: string;
}

export const mockMathQuestions: GmatMathQuestion[] = [
  {
    id: "math-alg-1",
    topic: "algebra",
    difficulty: "medium",
    questionText: "If x and y are non-zero integers such that 3^x * 5^y = 135, what is the value of x^2 + y^2?",
    options: ["5", "10", "13", "17", "25"],
    correctAnswerIndex: 1, // 10 is at index 1
    explanation: "First, find the prime factorization of 135: 135 = 5 * 27. Since 27 = 3^3, we can rewrite 135 as 3^3 * 5^1. Re-equating to the given expression 3^x * 5^y, we find that x must equal 3, and y must equal 1. Calculating x^2 + y^2 gives 3^2 + 1^2 = 9 + 1 = 10.",
    strategy: "On the GMAT, look for prime factorizations immediately when dealing with equations involving exponential structures with prime bases."
  },
  {
    id: "math-ari-1",
    topic: "arithmetic",
    difficulty: "medium",
    questionText: "An investment of $2,000 earns an annual simple interest rate of r percent. If the total interest earned over 4 years is $400, what is the annual interest rate r?",
    options: ["4%", "5%", "6%", "7.5%", "10%"],
    correctAnswerIndex: 1, // 5% is at index 1
    explanation: "The formula for simple interest is Interest (I) = Principal (P) * Rate (r) * Time (t), where rate is written as a fraction r/100. Substituting the given values: 400 = 2000 * (r / 100) * 4. This simplifies to 400 = 80 * r. Solving for r gives r = 400 / 80 = 5.",
    strategy: "Always distinguish between Simple Interest (I = P*r*t) and Compound Interest (A = P(1+r)^t) on the GMAT Focus Edition."
  },
  {
    id: "math-wp-1",
    topic: "word-problems",
    difficulty: "medium",
    questionText: "Machine A can complete a certain task in 6 hours, while Machine B can complete the same task in 9 hours. If both machines work simultaneously at their respective constant rates, how many hours will it take them to complete 5/6 of the task?",
    options: ["2 hours", "3 hours", "3.6 hours", "4 hours", "4.5 hours"],
    correctAnswerIndex: 1, // 3 hours is at index 1
    explanation: "Determine the hourly speed/rate of both machines: Rate A = 1/6 tasks/hour; Rate B = 1/9 tasks/hour. The combined rate is 1/6 + 1/9 = 3/18 + 2/18 = 5/18 tasks/hour. Utilizing the Work formula (Work = Rate * Time): 5/6 = (5/18) * t. Solving for t: t = (5/6) / (5/18) = (5/6) * (18/5) = 3 hours.",
    strategy: "For work and rate problems, sum the individual rates to find the combined working rate, never sum the hours directly!"
  },
  {
    id: "math-np-1",
    topic: "number-properties",
    difficulty: "medium",
    questionText: "If n is a positive integer such that n^2 is divisible by 72, which of the following must be a divisor of n?",
    options: ["12", "16", "18", "24", "36"],
    correctAnswerIndex: 0, // 12 is at index 0
    explanation: "Let's factor 72: 72 = 2^3 * 3^2. Since 72 divides n^2, the prime factors of n^2 must include at least three 2s and two 3s. Because n^2 is a perfect square, all power exponents in its prime factorization must be even numbers. Thus, n^2 must contain at least 2^4 * 3^2 in its prime factorization. Taking the square root to find n, n must contain at least 2^2 * 3^1 as primary factors, which is 4 * 3 = 12. Therefore, n must be a multiple of 12, so 12 must divide n.",
    strategy: "Divisibility and properties of perfect squares require exponents in prime factorization to be even; this factor constraint simplifies difficult divisor logic."
  },
  {
    id: "math-rw-1",
    topic: "rates-and-work",
    difficulty: "medium",
    questionText: "A car travels from Town A to Town B at an average speed of 60 miles per hour, and returns from Town B to Town A along the same route at an average speed of 40 miles per hour. If the total round trip takes 5 hours, what is the distance, in miles, between Town A and Town B?",
    options: ["100", "120", "150", "200", "240"],
    correctAnswerIndex: 1, // 120 is at index 1
    explanation: "Let the distance between Town A and Town B be d miles. The time taken to travel towards Town B is d/60 hours, and the time taken to return is d/40 hours. Since the total round trip time is 5 hours, we have: d/60 + d/40 = 5. Finding a common denominator (120): (2d + 3d)/120 = 5, which simplifies to 5d = 600. Solving for d gives d = 120 miles.",
    strategy: "GMAT average speed trap: The average speed is NOT the simple average (50 mph), but the harmonic mean (48 mph = 2 * 60 * 40 / (60 + 40)). Using Rate * Time = Total Distance, we get 48 * 5 = 240 miles round trip, so one-way is 120 miles."
  },
  {
    id: "math-rp-1",
    topic: "ratios-and-percents",
    difficulty: "hard",
    questionText: "A solution of 40 liters contains 15% alcohol. How many liters of pure alcohol must be added to this solution to make it a 32% alcohol solution?",
    options: ["5", "8", "10", "12", "15"],
    correctAnswerIndex: 2, // 10 is at index 2
    explanation: "Initial alcohol in the solution = 15% of 40 liters = 0.15 * 40 = 6 liters. Let x be the number of liters of pure alcohol added. The new alcohol content will be 6 + x liters, and the new total volume of the solution will be 40 + x liters. We want this alcohol content to be 32% of the new volume: (6 + x) / (40 + x) = 32/100. This simplifies to (6 + x) / (40 + x) = 8/25. Cross-multiplying: 25 * (6 + x) = 8 * (40 + x) => 150 + 25x = 320 + 8x => 17x = 170 => x = 10.",
    strategy: "For mixture and percentage problems, always set up an equation balancing the amount of solute (alcohol in this case) before and after changes."
  },
  {
    id: "math-sd-1",
    topic: "statistics-and-data",
    difficulty: "hard",
    questionText: "The average (arithmetic mean) of 7 consecutive integers is 15. If the greatest integer is removed, what is the average of the remaining 6 integers?",
    options: ["13.5", "14", "14.25", "14.5", "14.75"],
    correctAnswerIndex: 3, // 14.5 is at index 3
    explanation: "For any odd number of consecutive integers, the arithmetic mean is equal to the middle (median) integer. Thus, the 7 consecutive integers with a mean of 15 are centered at 15: 12, 13, 14, 15, 16, 17, and 18. If the greatest integer (18) is removed, the remaining 6 integers are: 12, 13, 14, 15, 16, and 17. The average of these 6 consecutive integers is the average of the two middle values (14 and 15), which is (14 + 15)/2 = 29/2 = 14.5.",
    strategy: "Leverage consecutive integer characteristics: the average is always the median of the set. This completely bypasses having to sum variables mechanically!"
  }
];
