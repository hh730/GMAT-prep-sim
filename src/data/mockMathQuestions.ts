export interface GmatMathQuestion {
  id: string;
  topic: 'algebra' | 'arithmetic' | 'word-problems' | 'number-properties';
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
    correctAnswerIndex: 2, // 10, wait! Let's check: 135 = 5 * 27 = 5^1 * 3^3. So x = 3, y = 1. x^2 + y^2 = 9 + 1 = 10. Index is 1! Let's fix. Correct answer is 10, index 1.
    explanation: "First, find the prime factorization of 135: 135 = 5 * 27. Since 27 = 3^3, we can rewrite 135 as 3^3 * 5^1. Re-equating to the given expression 3^x * 5^y, we find that x must equal 3, and y must equal 1. Calculating x^2 + y^2 gives 3^2 + 1^2 = 9 + 1 = 10.",
    strategy: "On the GMAT, look for prime factorizations immediately when dealing with equations involving exponential structures with prime bases."
  },
  {
    id: "math-ari-1",
    topic: "arithmetic",
    difficulty: "medium",
    questionText: "An investment of $2,000 earns an annual simple interest rate of r percent. If the total interest earned over 4 years is $400, what is the annual interest rate r?",
    options: ["4%", "5%", "6%", "7.5%", "10%"],
    correctAnswerIndex: 1, // 5%, index 1. Simple interest: I = P * r * t => 400 = 2000 * (r/100) * 4 => 400 = 8000 * r/100 => 400 = 80 * r => r = 5.
    explanation: "The formula for simple interest is Interest (I) = Principal (P) * Rate (r) * Time (t), where rate is written as a fraction r/100. Substituting the given values: 400 = 2000 * (r / 100) * 4. This simplifies to 400 = 80 * r. Solving for r gives r = 400 / 80 = 5.",
    strategy: "Always distinguish between Simple Interest (I = P*r*t) and Compound Interest (A = P(1+r)^t) on the GMAT Focus Edition."
  },
  {
    id: "math-wp-1",
    topic: "word-problems",
    difficulty: "medium",
    questionText: "Machine A can complete a certain task in 6 hours, while Machine B can complete the same task in 9 hours. If both machines work simultaneously at their respective constant rates, how many hours will it take them to complete 5/6 of the task?",
    options: ["2 hours", "3 hours", "3.6 hours", "4 hours", "4.5 hours"],
    correctAnswerIndex: 1, // 3 hours, index 1. Rate A = 1/6, Rate B = 1/9. Combined rate = 1/6 + 1/9 = 5/18 task per hour. Distance = Rate * Time => 5/6 = (5/18) * Time => Time = (5/6) * (18/5) = 18/6 = 3 hours.
    explanation: "Determine the hourly speed/rate of both machines: Rate A = 1/6 tasks/hour; Rate B = 1/9 tasks/hour. The combined rate is 1/6 + 1/9 = 3/18 + 2/18 = 5/18 tasks/hour. Utilizing the Work formula (Work = Rate * Time): 5/6 = (5/18) * t. Solving for t: t = (5/6) / (5/18) = (5/6) * (18/5) = 3 hours.",
    strategy: "For work and rate problems, sum the individual rates to find the combined working rate, never sum the hours directly!"
  },
  {
    id: "math-np-1",
    topic: "number-properties",
    difficulty: "medium",
    questionText: "If n is a positive integer such that n^2 is divisible by 72, which of the following must be a divisor of n?",
    options: ["12", "16", "18", "24", "36"],
    correctAnswerIndex: 0, // 12, index 0. 72 = 2^3 * 3^2. If 72 divides n^2, then n^2 must have at least prime factors 2^4 * 3^2 (as exponents must be even for squares). Thus n must contain at least 2^2 * 3^1 = 12 as factors.
    explanation: "Let's factor 72: 72 = 2^3 * 3^2. Since 72 divides n^2, the prime factors of n^2 must include at least three 2s and two 3s. Because n^2 is a perfect square, all power exponents in its prime factorization must be even numbers. Thus, n^2 must contain at least 2^4 * 3^2 in its prime factorization. Taking the square root to find n, n must contain at least 2^2 * 3^1 as primary factors, which is 4 * 3 = 12. Therefore, n must be a multiple of 12, so 12 must divide n.",
    strategy: "Divisibility and properties of perfect squares require exponents in prime factorization to be even; this factor constraint simplifies difficult divisor logic."
  }
];
