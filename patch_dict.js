const fs = require('fs');
const file = 'src/i18n/dictionaries.ts';
let content = fs.readFileSync(file, 'utf8');

const themeAndStyleKeys = `
    // --- Kiosk Flow: Dynamic UI ---
    camera_smile: "Smile!",
    camera_wheelchair: "I'm a wheelchair user",
    camera_retaking: "Retaking in...",
    
    // --- STYLES ---
    style_figurine_title: "1/7 Scale Figurine",
    style_figurine_detail: "Transform the person or group of people in the image into a 1/7 scale commercialized figurine set. The figures should be made of shiny PVC or ABS plastic. The lighting should be bright studio product lighting, highlighting the contours and glossy finish of the figures. Include a subtle, clean studio background. Maintain their facial features but stylize them as high-quality collectible figurines.",
    style_keychain_title: "3D Keychain",
    style_keychain_detail: "Transform the person or group of people in the image into a keychain character version of themselves. They should appear to be made of shiny, solid plastic, attached to a thick metal chain and a keyring. The lighting should be bright and colorful. Ensure the subjects maintain their distinct facial features but in a highly stylized, chunky keychain form. Focus on bold, saturated colors and glossy textures. Only include a single person or group on a single keychain.",
    style_oil_title: "Oil Painting",
    style_oil_detail: "Transform the person or group of people in this photo into a classic 19th-century oil painting on canvas. Use thick, visible impasto brushstrokes and a rich, deep color palette. The lighting should be dramatic chiaroscuro, with soft shadows and a warm glow on the persons face. The background should be a soft, textured abstract landscape or a dark studio setting. Ensure the final result looks like a physical painting with subtle canvas texture visible. Maintain their facial features.",
    style_clay_title: "Claymation",
    style_clay_detail: "Transform the person or group of people in the image into a handcrafted stop-motion claymation miniature, reimagined as an eccentric character with elongated limbs, expressive eyes, and a warm, heartwarming smile in a style merging Tim Burtons and Edward Goreys illustrations. This ultra-detailed cinematic shot features a shallow depth of field, moody practical lighting with deep shadows, and a storybook palette of midnight blue, deep plum, and antique gold. Maintain their facial features.",
    style_editorial_title: "Magazine Editorial",
    style_editorial_detail: "Transform the person or group of people in the image into a High-end business magazine cover photoshoot, crisp studio lighting, sharp focus, hyper-detailed, sophisticated styling, GQ or Forbes aesthetic.",
    style_cinematic_title: "Cinematic Epic",
    style_cinematic_detail: "Transform the person or group of people in the image into a Hollywood blockbuster cinematography, shot on 35mm anamorphic lens, dramatic rim lighting, epic scale, photorealistic, shallow depth of field.",
    style_noir_title: "Timeless Noir",
    style_noir_detail: "Transform the person or group of people in the image into a Classic black and white film noir style, dramatic high-contrast lighting, sharp shadows, elegant, vintage Leica camera aesthetic, sophisticated and powerful.",
    style_visionary_title: "Tech Visionary",
    style_visionary_detail: "Transform the person or group of people in the image into a Sleek futuristic aesthetic, subtle glowing neon accents, clean high-tech environment, hyper-realistic 3D render, forward-thinking corporate leadership vibe.",

    // --- THEMES ---
    theme_recipe_title: "Learn a new recipe",
    theme_recipe_var0_scene: "rustic Italian villa kitchen",
    theme_recipe_var0_activity: "kneading fresh pasta dough",
    theme_recipe_var1_scene: "molecular gastronomy lab",
    theme_recipe_var1_activity: "creating edible liquid nitrogen art",
    theme_recipe_var2_scene: "bustling street food market",
    theme_recipe_var2_activity: "tossing a perfect artisan pizza",

    theme_zen_title: "Find my zen",
    theme_zen_var0_scene: "misty mountaintop temple",
    theme_zen_var0_activity: "performing slow, graceful Tai Chi",
    theme_zen_var1_scene: "floating crystal lotus pod",
    theme_zen_var1_activity: "deep meditation in zero gravity",
    theme_zen_var2_scene: "glowing bioluminescent forest",
    theme_zen_var2_activity: "listening to the whispers of ancient trees",

    theme_active_title: "Get more active",
    theme_active_var0_scene: "neon-lit urban rooftop",
    theme_active_var0_activity: "mastering high-speed parkour",
    theme_active_var1_scene: "underwater coral gymnasium",
    theme_active_var1_activity: "swimming with mechanical dolphins",
    theme_active_var2_scene: "desert canyon adventure",
    theme_active_var2_activity: "rock climbing up a vertical mesa",

    theme_break_title: "Take a well-earned break",
    theme_break_var0_scene: "luxury cloud resort",
    theme_break_var0_activity: "lounging in a golden hammock",
    theme_break_var1_scene: "secluded x hot spring cave",
    theme_break_var1_activity: "soaking in steaming mineral waters",
    theme_break_var2_scene: "vintage jazz lounge on Mars",
    theme_break_var2_activity: "sipping a cosmic mocktail",

    theme_skill_title: "Learn a new skill",
    theme_skill_var0_scene: "master glassblower workshop",
    theme_skill_var0_activity: "shaping a molten glass phoenix",
    theme_skill_var1_scene: "grand symphony hall",
    theme_skill_var1_activity: "conducting an orchestra of musicians",
    theme_skill_var2_scene: "digital neon arcade",
    theme_skill_var2_activity: "winning a pro-gaming championship",

    theme_creative_title: "Get more creative",
    theme_creative_var0_scene: "rooftop garden studio",
    theme_creative_var0_activity: "sculpting a giant floral statue",
    theme_creative_var1_scene: "street art alleyway",
    theme_creative_var1_activity: "spray painting a vibrant mural",
    theme_creative_var2_scene: "grand symphony hall",
    theme_creative_var2_activity: "conducting an orchestra of lights",

    theme_imagination_title: "Let my imagination run loose",
    theme_imagination_var0_scene: "steampunk airship bridge",
    theme_imagination_var0_activity: "navigating through a thundercloud",
    theme_imagination_var1_scene: "giant mushroom kingdom",
    theme_imagination_var1_activity: "talking to a curious dragon",
    theme_imagination_var2_scene: "floating clockwork city",
    theme_imagination_var2_activity: "rewinding the gears of time",

    theme_green_title: "Master the Green",
    theme_green_var0_scene: "lush, sun-drenched championship golf course",
    theme_green_var0_activity: "sinking a perfect tournament-winning putt",
    theme_green_var1_scene: "exclusive private grass tennis court at golden hour",
    theme_green_var1_activity: "executing a flawless jumping backhand smash",
    theme_green_var2_scene: "dramatic cliffside golf hole overlooking a crashing ocean",
    theme_green_var2_activity: "teeing off into a spectacular sunset",

    theme_culinary_title: "Indulge my inner foodie",
    theme_culinary_var0_scene: "exclusive Chef's table in a Michelin-star kitchen",
    theme_culinary_var0_activity: "tasting a masterpiece of molecular gastronomy",
    theme_culinary_var1_scene: "sunlit luxury terrace overlooking the Amalfi coast",
    theme_culinary_var1_activity: "enjoying a perfectly plated truffle risotto",
    theme_culinary_var2_scene: "misty, ancient forest in the Piedmont region",
    theme_culinary_var2_activity: "foraging for rare white truffles with a master guide",

    theme_warrior_title: "Unleash the weekend warrior",
    theme_warrior_var0_scene: "rugged, pine-covered mountain bike trail",
    theme_warrior_var0_activity: "catching air over a massive dirt jump",
    theme_warrior_var1_scene: "remote, untouched backcountry mountain peak",
    theme_warrior_var1_activity: "carving fresh powder tracks on a snowboard",
    theme_warrior_var2_scene: "roaring, crystal-clear white-water canyon river",
    theme_warrior_var2_activity: "expertly navigating a sleek carbon-fiber kayak",

    theme_racing_title: "Chase the Grand Prix thrill",
    theme_racing_var0_scene: "sweeping corner of a sunlit private race circuit",
    theme_racing_var0_activity: "steering a roaring vintage Ferrari",
    theme_racing_var1_scene: "glamorous Monaco street circuit at dusk",
    theme_racing_var1_activity: "celebrating a first-place podium finish",
    theme_racing_var2_scene: "pristine, high-tech luxury racing garage",
    theme_racing_var2_activity: "analyzing telemetry data next to a Le Mans hypercar",

    theme_alpine_title: "Conquer the Alpine peaks",
    theme_alpine_var0_scene: "dramatic, snow-capped Swiss summit",
    theme_alpine_var0_activity: "standing victorious with an ice axe in hand",
    theme_alpine_var1_scene: "sheer, vertical granite rock face above the clouds",
    theme_alpine_var1_activity: "free-climbing with intense focus and grip",
    theme_alpine_var2_scene: "remote, untouched glacier in British Columbia",
    theme_alpine_var2_activity: "carving the first tracks after a thrilling heli-drop",
`;

let enPart = content.substring(0, content.indexOf('  ko: {'));
let koPart = content.substring(content.indexOf('  ko: {'));

// Inject into English
enPart = enPart.replace(
  '    // --- Kiosk Flow: Loading ---',
  themeAndStyleKeys + '\n    // --- Kiosk Flow: Loading ---'
);

// Create Korean translation strings by replacing the text with [KOREAN] Original Text
let koThemeAndStyleKeys = themeAndStyleKeys.split('\n').map(line => {
  if (line.includes(': "')) {
    return line.replace(': "', ': "[KOREAN] ');
  }
  return line;
}).join('\n');

// Inject into Korean
koPart = koPart.replace(
  '    // --- Kiosk Flow: Loading ---',
  koThemeAndStyleKeys + '\n    // --- Kiosk Flow: Loading ---'
);

fs.writeFileSync(file, enPart + koPart);
console.log('Dictionaries Patched');
