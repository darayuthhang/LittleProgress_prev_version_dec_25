export interface Turtle {
  id: string;
  name: string;
  requiredPoints: number;
  image: string; 
  description: string;
}

export const TURTLES: Turtle[] = [
  {
    id: "default_turtle",
    name: "Baby Turtle",
    requiredPoints: 0,
    image: "turtle_default", 
    description: "Your first companion.",
  },
  {
    id: "green_turtle",
    name: "Garden Turtle",
    requiredPoints: 50,
    image: "turtle_green",
    description: "Loves to hide in the leaves.",
  },
  {
    id: "blue_turtle",
    name: "Ocean Turtle",
    requiredPoints: 100,
    image: "turtle_blue",
    description: "Swims in the deep blue sea.",
  },
  {
    id: "ninja_turtle",
    name: "Ninja Turtle",
    requiredPoints: 200,
    image: "turtle_ninja",
    description: "Stealthy and fast.",
  },
  {
    id: "golden_turtle",
    name: "Golden Turtle",
    requiredPoints: 500,
    image: "turtle_gold",
    description: "Shines brighter than the sun.",
  },
];
