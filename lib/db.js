import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const PROMPTS_FILE = path.join(DATA_DIR, "prompts.json");
const AVATAR_FILE = path.join(DATA_DIR, "avatar.json");

const SEED_PROMPTS = [
  {
    id: "p1",
    model: "Midjourney",
    cat: "Photography",
    title: "Cinematic Rainy Night Portrait",
    likes: 1463,
    text: "Ultra-realistic cinematic photograph, rainy night city street, subject walking in profile, wet asphalt reflections, soft neon lights, atmospheric fog, 24mm wide-angle lens, deep environment, realistic skin texture, high-end cinema camera, dark movie color grading, natural shadows, --ar 16:9 --style raw",
    negative: "blurry, low quality, oversaturated, distorted face, extra limbs",
    coverStyle: "v-neon",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop",
    createdAt: Date.now() - 86400000 * 5,
    isUserCreated: false
  },
  {
    id: "p2",
    model: "Nano Banana",
    cat: "Product",
    title: "Miniature Burger Restaurant",
    likes: 906,
    text: "Ultra-realistic 3D miniature diorama of a gourmet burger transformed into a restaurant, sesame bun as the roof, lettuce and cheese integrated into architecture, miniature chefs and customers inside, warm commercial lighting, highly detailed textures, tilt-shift photorealistic.",
    negative: "plastic look, flat render, poor lighting",
    coverStyle: "v-amber",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop",
    createdAt: Date.now() - 86400000 * 4,
    isUserCreated: false
  },
  {
    id: "p3",
    model: "FLUX",
    cat: "Fantasy",
    title: "Lone Female Samurai",
    likes: 738,
    text: "A lone female samurai beneath a dark midnight sky, gripping a glowing katana, drifting embers, supernatural blue flames, windswept long dark hair, intricate traditional armor with gold leaf trim, dramatic rim lighting, deep shadows, cinematic fantasy digital painting, 8k resolution.",
    negative: "cartoon, anime eyes, low poly, 3d render, blurry",
    coverStyle: "v-crimson",
    imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop",
    createdAt: Date.now() - 86400000 * 3,
    isUserCreated: false
  },
  {
    id: "p4",
    model: "Stable Diffusion",
    cat: "Anime",
    title: "Sea Sunset Magical Realism",
    likes: 451,
    text: "Makoto Shinkai style anime illustration of a girl with reddish-brown hair sitting beside the tranquil sea with an open leather notebook, distant sunset mountains, crimson and gold cloud reflections, magical sky sparkles, soft wind, high detail masterpiece.",
    negative: "bad anatomy, ugly hands, missing fingers, grain, worst quality",
    coverStyle: "v-violet",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",
    createdAt: Date.now() - 86400000 * 2,
    isUserCreated: false
  },
  {
    id: "p5",
    model: "ChatGPT Image",
    cat: "Architecture",
    title: "Futuristic Glass Alpine Villa",
    likes: 370,
    text: "Photorealistic futuristic glass house nestled in a misty mountain valley, brutalist geometric architecture, warm glowing interior lights, wet stone surfaces, cinematic dawn atmosphere, architectural photography, 35mm lens, natural timber accent, ultra detailed render.",
    negative: "overexposed, artificial landscape, low res",
    coverStyle: "v-cyan",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop",
    createdAt: Date.now() - 86400000 * 1,
    isUserCreated: false
  },
  {
    id: "p6",
    model: "Seedream",
    cat: "Fashion",
    title: "Editorial Concrete Streetwear",
    likes: 322,
    text: "High-end editorial fashion photograph, avant-garde modern streetwear outfit, sharp side shadow lighting, textured raw concrete background, subtle analog film grain, realistic fabric folds, shot on 85mm f/1.4 lens, shallow depth of field, Vogue magazine aesthetic.",
    negative: "out of frame, deformed, low resolution",
    coverStyle: "v-rose",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop",
    createdAt: Date.now() - 3600000 * 12,
    isUserCreated: false
  },
  {
    id: "p7",
    model: "Midjourney",
    cat: "Cyberpunk",
    title: "Neon Tokyo Night Alley",
    likes: 580,
    text: "High contrast cyberpunk street photograph, rain-slicked Tokyo alley, vibrant pink and cyan neon signs, holographic advertisements, wet reflections on asphalt, atmospheric haze, 35mm lens, f/1.8 aperture, 8k resolution.",
    negative: "blurry, low contrast, washed out",
    coverStyle: "v-neon",
    imageUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop",
    createdAt: Date.now() - 3600000 * 8,
    isUserCreated: false
  },
  {
    id: "p8",
    model: "FLUX",
    cat: "Sci-Fi",
    title: "Astronaut Deep Space Nebula",
    likes: 812,
    text: "Photorealistic digital art of a solitary astronaut floating in deep space facing a colorful cosmic nebula, golden reflection on helmet visor, intricate space suit details, hyper realistic zero gravity atmosphere, dramatic starlight.",
    negative: "low res, flat lighting, distorted helmet",
    coverStyle: "v-violet",
    imageUrl: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&auto=format&fit=crop",
    createdAt: Date.now() - 3600000 * 4,
    isUserCreated: false
  }
];

let memoryUserSession = null;
let memoryUsersRegistry = null;
let memoryPrompts = null;

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {}
}

/**
 * Get all prompts from DB (with initial seeding fallback)
 */
export function getPromptsDB() {
  if (memoryPrompts) return memoryPrompts;
  ensureDataDir();
  if (!fs.existsSync(PROMPTS_FILE)) {
    savePromptsDB(SEED_PROMPTS);
    return SEED_PROMPTS;
  }
  try {
    const raw = fs.readFileSync(PROMPTS_FILE, "utf-8");
    memoryPrompts = JSON.parse(raw);
    return memoryPrompts;
  } catch (err) {
    return SEED_PROMPTS;
  }
}

/**
 * Save all prompts to DB
 */
export function savePromptsDB(prompts) {
  memoryPrompts = prompts;
  try {
    ensureDataDir();
    fs.writeFileSync(PROMPTS_FILE, JSON.stringify(prompts, null, 2), "utf-8");
  } catch (err) {}
}

/**
 * Get user profile avatar from DB
 */
export function getAvatarDB() {
  ensureDataDir();
  if (fs.existsSync(AVATAR_FILE)) {
    try {
      const raw = fs.readFileSync(AVATAR_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.avatar) return parsed.avatar;
    } catch (err) {}
  }
  const user = getUserDB();
  return user?.avatar || null;
}

const USER_FILE = path.join(DATA_DIR, "user.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");

/**
 * Save user profile avatar to DB
 */
export function saveAvatarDB(avatarData) {
  try {
    ensureDataDir();
    fs.writeFileSync(AVATAR_FILE, JSON.stringify({ avatar: avatarData, updatedAt: Date.now() }, null, 2), "utf-8");
  } catch (err) {}

  // Sync avatar with active logged-in user profile in user.json
  const user = getUserDB();
  if (user) {
    user.avatar = avatarData;
    user.updatedAt = Date.now();
    saveUserDB(user);
  }
}

/**
 * Get user account profile from DB
 */
export function getUserDB() {
  if (memoryUserSession !== null) {
    return memoryUserSession && memoryUserSession.isLoggedIn ? memoryUserSession : null;
  }
  ensureDataDir();
  if (!fs.existsSync(USER_FILE)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(USER_FILE, "utf-8");
    if (!raw || raw.trim() === "null") return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.isLoggedIn) return null;
    memoryUserSession = parsed;
    return parsed;
  } catch (err) {
    return null;
  }
}

/**
 * Get all registered users dictionary from users.json
 */
export function getUsersRegistryDB() {
  if (memoryUsersRegistry) return memoryUsersRegistry;
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(USERS_FILE, "utf-8");
    memoryUsersRegistry = JSON.parse(raw);
    return memoryUsersRegistry;
  } catch (err) {
    return {};
  }
}

/**
 * Find user profile by email address
 */
export function getUserByEmailDB(email) {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();

  if (cleanEmail === "ujjwal@gmail.com") {
    const active = getUserDB();
    if (active && active.email === "ujjwal@gmail.com") return active;
    return {
      id: "u_admin_ujjwal",
      name: "Ujjwal Manandhar",
      email: "ujjwal@gmail.com",
      password: "ujjwal7077",
      isAdmin: true,
      role: "Admin & Creator"
    };
  }

  const registry = getUsersRegistryDB();
  if (registry[cleanEmail]) {
    return registry[cleanEmail];
  }

  const activeUser = getUserDB();
  if (activeUser && activeUser.email && activeUser.email.toLowerCase().trim() === cleanEmail) {
    return activeUser;
  }

  return null;
}

/**
 * Save user account profile to DB (and multi-user registry)
 */
export function saveUserDB(userData) {
  memoryUserSession = userData;
  try {
    ensureDataDir();
    fs.writeFileSync(USER_FILE, JSON.stringify(userData, null, 2), "utf-8");
  } catch (err) {}

  if (userData && userData.email) {
    try {
      let users = memoryUsersRegistry || {};
      if (fs.existsSync(USERS_FILE)) {
        users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
      }
      users[userData.email.toLowerCase().trim()] = userData;
      memoryUsersRegistry = users;
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
    } catch (err) {}
  }
}

/**
 * Increment or decrement prompt likes in DB
 */
export function likePromptDB(id, increment = true) {
  const prompts = getPromptsDB();
  const index = prompts.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const currentLikes = prompts[index].likes || 0;
  prompts[index].likes = Math.max(0, increment ? currentLikes + 1 : currentLikes - 1);
  savePromptsDB(prompts);
  return prompts[index];
}

/**
 * Get aggregated database platform statistics
 */
export function getStatsDB() {
  const prompts = getPromptsDB();
  const totalPrompts = prompts.length;
  const totalLikes = prompts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const models = {};
  const categories = {};

  prompts.forEach((p) => {
    if (p.model) models[p.model] = (models[p.model] || 0) + 1;
    if (p.cat) categories[p.cat] = (categories[p.cat] || 0) + 1;
  });

  return {
    totalPrompts,
    totalLikes,
    modelsCount: Object.keys(models).length,
    categoriesCount: Object.keys(categories).length,
    topModel: Object.entries(models).sort((a, b) => b[1] - a[1])[0]?.[0] || "Midjourney",
    models,
    categories
  };
}
