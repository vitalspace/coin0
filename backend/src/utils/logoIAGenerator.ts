// 1. Define arrays with various options
const styles = [
  "minimalist cartoon style",
  "retro-futuristic style",
  "cyberpunk style",
  "pixel art style",
  "realistic 3D style",
  "aesthetic style",
  "abstract style",
  "surreal style",
  "futuristic style",
  "fantasy style",
  "gothic style",
  "medieval style",
  "vintage style",
];

const colorPalettes = [
  "soft pastel colors",
  "vibrant neon colors",
  "gold and silver palette",
  "earthy tones with striking accents",
  "intense colors with high contrast",
  "pastel pastel pastel",
  "black and white with a pop of color",
  "a rainbow of colors",
  "a gradient of colors",
];

const mainElements = [
  "an astronaut hamster",
  "a cat with sunglasses",
  "a cartoonish dragon",
  "a pixelated phoenix",
  "a funny robot",
  "a llama with a rocket",
  "a cute monster",
  "a magical unicorn",
  "a futuristic cyborg",
  "a space explorer",
  "a robot with a heart",
  "a magical fairy",
  "a mystical mermaid",
  "a cute alien",
  "a friendly ghost",
  "a magical potion bottle",
  "a treasure chest",
  "a mysterious key",
  "a shiny diamond",
  "a glowing crystal",
  "a magical wand",
  "a shooting star",
  "a moon with a face",
  "a planet with rings",
  "a rocket ship",
];

// 2. Function to get a random element from an array
function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 3. Build the prompt dynamically
function buildLogoPrompt(coinName: string): string {
  // Select a random style, color palette, and main element
  const chosenStyle = getRandomElement(styles);
  const chosenColors = getRandomElement(colorPalettes);
  const chosenElement = getRandomElement(mainElements);

  // Create the prompt with clear instructions
  return `
  Generate a logo for a memecoin called "${coinName}".
  Requirements:
  - ${chosenStyle}.
  - Use ${chosenColors}.
  - Include the text "${coinName}" in a typography suitable for the style.
  - Transparent background (PNG format).
  `;
}

export { buildLogoPrompt };
