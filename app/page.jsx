'use client';

import { useMemo, useState, useEffect } from "react";
import {
  Search,
  Copy,
  Heart,
  SlidersHorizontal,
  Sparkles,
  Plus,
  X,
  Edit3,
  Trash2,
  Image as ImageIcon,
  Check,
  Wand2,
  Grid,
  Bookmark,
  ArrowUpDown,
  Upload,
  Layers,
  Zap,
  Info,
  User,
  Camera,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Loader2,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Globe,
  Code,
  FileCode,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

// Helper to format image URLs gracefully
const formatImageUrl = (url) => {
  if (!url) return "";
  const clean = url.trim();
  if (!clean) return "";
  if (clean.startsWith("data:image/") || clean.startsWith("/") || clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }
  return "https://" + clean;
};

// Images for login profile slider showcase (auto-slides every 2s)
const LOGIN_PROFILE_IMAGES = [
  {
    id: 1,
    src: "/login-profile/profile.jpg",
    title: "Selected Works",
    creator: "Ujjwal Prompt",
    role: "UI & Prompt Studio"
  },
  {
    id: 2,
    src: "/login-profile/profile2.jpg",
    title: "Featured Works",
    creator: "Ujjwal Prompt",
    role: "UI & Prompt Studio"
  },
  {
    id: 3,
    src: "/login-profile/profile3.jpg",
    title: "Creative Prompt",
    creator: "Ujjwal Prompt",
    role: "UI & Prompt Studio"
  },
  {
    id: 4,
    src: "/login-profile/profile4.jpg",
    title: "Visual Showcase",
    creator: "Ujjwal Prompt",
    role: "UI & Prompt Studio"
  },
  {
    id: 5,
    src: "/login-profile/peofile4.jpg",
    title: "AI Studio Art",
    creator: "Ujjwal Prompt",
    role: "UI & Prompt Studio"
  }
];

// Pre-defined initial prompts with curated visual images
const INITIAL_PROMPTS = [
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

const MODELS = ["All", "Midjourney", "FLUX", "Stable Diffusion", "Nano Banana", "ChatGPT Image", "Seedream", "DALL-E 3", "Sora"];
const CATEGORIES = ["All", "Photography", "Product", "Fantasy", "Anime", "Architecture", "Fashion", "Sci-Fi", "Cyberpunk"];
const VISUAL_THEMES = [
  { id: "v-neon", label: "Neon Cyber", color: "from-purple-600 via-pink-600 to-blue-600" },
  { id: "v-amber", label: "Warm Gold", color: "from-amber-500 via-orange-600 to-red-700" },
  { id: "v-crimson", label: "Crimson Flame", color: "from-red-600 via-purple-700 to-slate-900" },
  { id: "v-violet", label: "Deep Violet", color: "from-indigo-600 via-violet-600 to-pink-500" },
  { id: "v-cyan", label: "Emerald Cyan", color: "from-cyan-500 via-teal-600 to-emerald-800" },
  { id: "v-rose", label: "Midnight Rose", color: "from-pink-600 via-purple-800 to-neutral-900" }
];

export default function Home() {
  const [prompts, setPrompts] = useState(INITIAL_PROMPTS);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "my" | "favs"
  const [q, setQ] = useState("");
  const [model, setModel] = useState("All");
  const [cat, setCat] = useState("All");
  const [sortBy, setSortBy] = useState("popular"); // "popular" | "newest" | "title"

  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [toast, setToast] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  // User Authentication & Session State
  const [currentUser, setCurrentUser] = useState(null); // null when logged out, user obj when logged in
  const [userAvatar, setUserAvatar] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login"); // "login" | "signup"
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", avatar: "" });

  // Dynamic Login Profile folder images state
  const [profileImages, setProfileImages] = useState(LOGIN_PROFILE_IMAGES);
  const [authSlideIndex, setAuthSlideIndex] = useState(0);
  const [isSlideTransitioning, setIsSlideTransitioning] = useState(true);

  // Fetch dynamic image list from login profile folder via backend API route
  const fetchLoginProfileImages = async () => {
    try {
      const res = await fetch("/api/login-profiles");
      const data = await res.json();
      if (data.success && data.images && data.images.length > 0) {
        setProfileImages(data.images);
      }
    } catch (err) {
      console.error("Error loading dynamic login profile images:", err);
    }
  };

  useEffect(() => {
    fetchLoginProfileImages();
  }, [isAuthModalOpen]);

  // Cloned first slide appended to end for seamless continuous forward loop
  const LOOP_SLIDES = useMemo(() => {
    if (!profileImages || profileImages.length === 0) return [];
    return [...profileImages, { ...profileImages[0], isClone: true }];
  }, [profileImages]);

  const totalImagesCount = profileImages.length;
  const realSlideIndex = totalImagesCount > 0 ? authSlideIndex % totalImagesCount : 0;

  const handleNextAuthSlide = () => {
    setIsSlideTransitioning(true);
    setAuthSlideIndex((prev) => prev + 1);
  };

  const handlePrevAuthSlide = (e) => {
    if (e) e.stopPropagation();
    if (authSlideIndex === 0) {
      // Snap instantly to cloned end slide with no transition, then smoothly slide to last real index
      setIsSlideTransitioning(false);
      setAuthSlideIndex(totalImagesCount);
      setTimeout(() => {
        setIsSlideTransitioning(true);
        setAuthSlideIndex(totalImagesCount - 1);
      }, 40);
    } else {
      setIsSlideTransitioning(true);
      setAuthSlideIndex((prev) => prev - 1);
    }
  };

  // Reset from cloned slide to real slide 0 invisibly once slide animation completes
  useEffect(() => {
    if (totalImagesCount > 0 && authSlideIndex === totalImagesCount) {
      const resetTimer = setTimeout(() => {
        setIsSlideTransitioning(false);
        setAuthSlideIndex(0);
      }, 700); // 700ms matches CSS transition duration
      return () => clearTimeout(resetTimer);
    }
  }, [authSlideIndex, totalImagesCount]);

  // Auto-slide every 2 seconds when auth modal is open
  useEffect(() => {
    if (!isAuthModalOpen) return;
    const slideTimer = setInterval(() => {
      handleNextAuthSlide();
    }, 2000);
    return () => clearInterval(slideTimer);
  }, [isAuthModalOpen]);

  // Real-time Email & DNS MX Validation State
  const [emailValidation, setEmailValidation] = useState({
    isValidating: false,
    isValid: null,
    message: "",
    domain: ""
  });

  // Real-time email validation with backend DNS MX lookup
  const validateEmailRealtime = async (emailToValidate) => {
    const clean = (emailToValidate || "").trim().toLowerCase();
    if (!clean) {
      setEmailValidation({ isValidating: false, isValid: null, message: "", domain: "" });
      return;
    }

    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!EMAIL_REGEX.test(clean)) {
      setEmailValidation({
        isValidating: false,
        isValid: false,
        message: "Invalid format (must be user@example.com)",
        domain: ""
      });
      return;
    }

    setEmailValidation({
      isValidating: true,
      isValid: null,
      message: "Verifying active mail servers (DNS MX)...",
      domain: clean.split("@")[1] || ""
    });

    try {
      const res = await fetch("/api/validate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean })
      });
      const result = await res.json();
      if (res.ok && result.valid) {
        setEmailValidation({
          isValidating: false,
          isValid: true,
          message: `Active mail server found (@${result.domain})`,
          domain: result.domain
        });
      } else {
        setEmailValidation({
          isValidating: false,
          isValid: false,
          message: result.reason || `Domain @${clean.split("@")[1]} has no active mail servers`,
          domain: clean.split("@")[1] || ""
        });
      }
    } catch (err) {
      setEmailValidation({
        isValidating: false,
        isValid: false,
        message: "Unable to verify mail server",
        domain: ""
      });
    }
  };

  // Form modal state for Create / Update prompt
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromptId, setEditingPromptId] = useState(null); // null = create new, string = update existing
  const [formData, setFormData] = useState({
    title: "",
    model: "Midjourney",
    cat: "Photography",
    text: "",
    negative: "",
    coverStyle: "v-neon",
    imageUrl: "",
    likes: 1,
    isHtmlMode: false
  });

  // Adjust Likes (+1 / -1) for any prompt card (Admin Only)
  const handleAdjustLikes = async (id, delta, e) => {
    if (e) e.stopPropagation();
    if (!isAdmin) {
      showToast("Access required! Only ujjwal@gmail.com can adjust prompt popularity 🔒");
      return;
    }
    const targetPrompt = prompts.find((p) => p.id === id);
    if (!targetPrompt) return;

    const newLikes = Math.max(0, (targetPrompt.likes || 0) + delta);
    const updatedList = prompts.map((p) => (p.id === id ? { ...p, likes: newLikes } : p));

    setPrompts(updatedList);
    try {
      localStorage.setItem("promptverse_gallery_v1", JSON.stringify(updatedList));
    } catch (err) {}

    if (selected && selected.id === id) {
      setSelected({ ...selected, likes: newLikes });
    }

    try {
      await fetch("/api/prompts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_likes", id, likes: newLikes })
      });
    } catch (err) {}
  };

  // Re-order Prompt position up/down for Admin (ujjwal@gmail.com)
  const handleMovePrompt = async (id, direction, e) => {
    if (e) e.stopPropagation();
    if (!isAdmin) return;
    const index = prompts.findIndex((p) => p.id === id);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= prompts.length) return;

    const updated = [...prompts];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);

    setPrompts(updated);
    try {
      localStorage.setItem("promptverse_gallery_v1", JSON.stringify(updated));
    } catch (err) {}

    try {
      await fetch("/api/prompts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompts: updated })
      });
    } catch (err) {}
  };

  // Fetch prompts, avatar, and user session from secure Backend API on mount
  useEffect(() => {
    async function loadBackendData() {
      // 1. Instant load from localStorage cache
      try {
        const cachedAvatar = localStorage.getItem("promptverse_user_avatar_v1");
        if (cachedAvatar) {
          setUserAvatar(cachedAvatar);
        }

        const cachedPrompts = localStorage.getItem("promptverse_gallery_v1");
        if (cachedPrompts) {
          const parsed = JSON.parse(cachedPrompts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPrompts(parsed);
          }
        }
      } catch (e) { }

      // 2. Sync with persistent backend API
      try {
        const [promptsRes, userRes, avatarRes] = await Promise.all([
          fetch("/api/prompts"),
          fetch("/api/auth"),
          fetch("/api/avatar")
        ]);

        if (promptsRes.ok) {
          const promptsData = await promptsRes.json();
          if (promptsData.success && Array.isArray(promptsData.data)) {
            setPrompts(promptsData.data);
            try {
              localStorage.setItem("promptverse_gallery_v1", JSON.stringify(promptsData.data));
            } catch (e) { }
          }
        }

        let loadedAvatar = "";
        if (avatarRes.ok) {
          const avatarData = await avatarRes.json();
          if (avatarData.success && avatarData.avatar) {
            loadedAvatar = avatarData.avatar;
          }
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.success && userData.user) {
            const userObj = userData.user;
            if (loadedAvatar && !userObj.avatar) {
              userObj.avatar = loadedAvatar;
            }
            setCurrentUser(userObj);
            if (userObj.avatar) {
              loadedAvatar = userObj.avatar;
            }
            if (Array.isArray(userObj.favorites) && userObj.favorites.length > 0) {
              setFavorites(userObj.favorites);
              try {
                localStorage.setItem("promptverse_favs_v1", JSON.stringify(userObj.favorites));
              } catch (e) { }
            }
          }
        }

        if (loadedAvatar) {
          setUserAvatar(loadedAvatar);
          try {
            localStorage.setItem("promptverse_user_avatar_v1", loadedAvatar);
          } catch (e) { }
        }

        const savedFavs = localStorage.getItem("promptverse_favs_v1");
        if (savedFavs) {
          setFavorites(JSON.parse(savedFavs));
        }
      } catch (e) {
        console.error("Failed to load backend API data:", e);
      }
    }
    loadBackendData();
  }, []);

  // Handle Authentication Submission (Login / Sign Up)
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = (authForm.email || "").trim().toLowerCase();
    const cleanPassword = (authForm.password || "").trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      showToast("Please enter a valid email address!");
      return;
    }
    if (!cleanPassword || cleanPassword.length < 4) {
      showToast("Password must be at least 4 characters!");
      return;
    }

    if (authTab === "signup") {
      if (emailValidation.isValid === false) {
        showToast(`Email Error: ${emailValidation.message}`);
        return;
      }
      if (emailValidation.isValidating) {
        showToast("Please wait for mail server verification...");
        return;
      }
    }

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: authTab,
          name: authForm.name,
          email: cleanEmail,
          password: cleanPassword,
          avatar: authForm.avatar || userAvatar
        })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setCurrentUser(result.user);
        if (result.user.avatar) setUserAvatar(result.user.avatar);
        setIsAuthModalOpen(false);
        setAuthForm({ name: "", email: "", password: "", avatar: "" });
        showToast(authTab === "login" ? `Welcome back, ${result.user.name}! 👋` : "Account created successfully! 🎉");
      } else if (result.notFound) {
        showToast("Account not found! Redirecting to Create Account... 🚀");
        setAuthTab("signup");
        validateEmailRealtime(cleanEmail);
      } else if (result.alreadyExists) {
        showToast("Account already exists! Please sign in with your password 🔒");
        setAuthTab("login");
      } else {
        showToast(`Auth Error: ${result.error || "Authentication failed"}`);
      }
    } catch (err) {
      showToast("Server connection error during login");
    }
  };

  // Quick Guest Sign In
  const handleGuestLogin = async () => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          name: "Guest Creator",
          email: "guest@promptverse.ai",
          password: "password123",
          avatar: userAvatar
        })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setCurrentUser(result.user);
        setIsAuthModalOpen(false);
        showToast("Logged in as Guest Creator! 🚀");
      }
    } catch (err) {
      showToast("Guest login failed");
    }
  };

  // Logout / Sign Out
  const handleLogout = async () => {
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" })
      });
      setCurrentUser(null);
      setUserAvatar("");
      localStorage.removeItem("promptverse_user_avatar_v1");
      setIsAuthModalOpen(false);
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  // Save or remove user avatar on server backend API & local storage
  const saveUserAvatar = async (avatarUrl) => {
    const cleanAvatar = (avatarUrl || "").trim();
    setUserAvatar(cleanAvatar);
    if (currentUser) {
      setCurrentUser((prev) => (prev ? { ...prev, avatar: cleanAvatar } : null));
    }
    try {
      if (cleanAvatar) {
        localStorage.setItem("promptverse_user_avatar_v1", cleanAvatar);
      } else {
        localStorage.removeItem("promptverse_user_avatar_v1");
      }
      await fetch("/api/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: cleanAvatar })
      });
    } catch (e) {
      console.error("API avatar save failed:", e);
    }
    showToast(cleanAvatar ? "User avatar updated! 👤✨" : "Avatar removed 🗑️");
  };

  // Upload user avatar file
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      showToast("Optimizing avatar image... ⏳");
      try {
        const resizedAvatar = await resizeAndCompressImage(file, 350, 0.9);
        saveUserAvatar(resizedAvatar);
      } catch (err) {
        showToast("Failed to upload avatar");
      }
    }
  };

  // Helper to convert Base64 Data URL to Blob for Clipboard
  const dataURItoBlob = (dataURI) => {
    try {
      const byteString = atob(dataURI.split(',')[1]);
      const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
    } catch (e) {
      return null;
    }
  };

  // Save prompts to localStorage on change
  const savePromptsToStorage = (updatedPrompts) => {
    setPrompts(updatedPrompts);
    try {
      localStorage.setItem("promptverse_gallery_v1", JSON.stringify(updatedPrompts));
    } catch (e) {
      console.error("Failed to save to local storage:", e);
    }
  };

  const toggleFavorite = async (id) => {
    const isFav = favorites.includes(id);
    const nextFavs = isFav ? favorites.filter((x) => x !== id) : [...favorites, id];
    setFavorites(nextFavs);

    try {
      localStorage.setItem("promptverse_favs_v1", JSON.stringify(nextFavs));

      const [likeRes] = await Promise.all([
        fetch(`/api/prompts/${id}/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: isFav ? "unlike" : "like" })
        }),
        fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update_favorites", favorites: nextFavs })
        })
      ]);

      if (likeRes && likeRes.ok) {
        const result = await likeRes.json();
        if (result.success && typeof result.likes === "number") {
          setPrompts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, likes: result.likes } : p))
          );
        }
      }
    } catch (err) {
      console.error("Failed to sync like with backend:", err);
    }
    showToast(isFav ? "Removed from favorites" : "Saved to favorites ❤️");
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  // Copy text prompt to clipboard (supports HTML Web Design Mode prefix)
  const handleCopy = (text, id = null, isHtmlMode = false) => {
    let formattedText = text;
    if (isHtmlMode) {
      formattedText = "Make a web design in .html using this prompt\n\n" + text;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(formattedText);
      setCopiedId(id);
      showToast(isHtmlMode ? "Copied with HTML Web Design prefix! 💻✨" : "Prompt copied to clipboard! ✨");
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  // Check if current user is logged in as Admin (ujjwal@gmail.com)
  const isAdmin = useMemo(() => {
    return Boolean(currentUser && currentUser.isLoggedIn && currentUser.email === "ujjwal@gmail.com");
  }, [currentUser]);

  // Open modal for CREATING new prompt (Admin Only)
  const openCreateModal = () => {
    if (!isAdmin) {
      showToast("Editing access required! Please sign in with ujjwal@gmail.com 🔒");
      setAuthTab("login");
      setAuthForm((prev) => ({ ...prev, email: "ujjwal@gmail.com" }));
      setIsAuthModalOpen(true);
      return;
    }
    setEditingPromptId(null);
    setFormData({
      title: "",
      model: "Midjourney",
      cat: "Photography",
      text: "",
      negative: "",
      coverStyle: "v-neon",
      imageUrl: "",
      likes: 1,
      isHtmlMode: false
    });
    setIsModalOpen(true);
  };

  // Open modal for UPDATING existing prompt (Admin Only)
  const openUpdateModal = (promptObj, e = null) => {
    if (e) e.stopPropagation();
    if (!isAdmin) {
      showToast("Editing access required! Please sign in with ujjwal@gmail.com 🔒");
      setAuthTab("login");
      setAuthForm((prev) => ({ ...prev, email: "ujjwal@gmail.com" }));
      setIsAuthModalOpen(true);
      return;
    }
    setEditingPromptId(promptObj.id);
    setFormData({
      title: promptObj.title || "",
      model: promptObj.model || "Midjourney",
      cat: promptObj.cat || "Photography",
      text: promptObj.text || "",
      negative: promptObj.negative || "",
      coverStyle: promptObj.coverStyle || "v-neon",
      imageUrl: promptObj.imageUrl || "",
      likes: promptObj.likes || 1,
      isHtmlMode: Boolean(promptObj.isHtmlMode)
    });
    setIsModalOpen(true);
  };

  // Handle Form Submission (Add OR Update) via secure API
  const handleSavePrompt = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast("Editing access required! Please sign in with ujjwal@gmail.com 🔒");
      return;
    }
    if (!formData.title.trim() || !formData.text.trim()) {
      showToast("Please provide both a Title and Prompt Text!");
      return;
    }

    try {
      if (editingPromptId) {
        // UPDATE existing prompt via PUT /api/prompts/[id]
        const res = await fetch(`/api/prompts/${editingPromptId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        const result = await res.json();
        if (!res.ok || !result.success) {
          showToast(`Error: ${result.error || "Failed to update prompt"}`);
          return;
        }
        const updatedPrompt = result.data;
        const updatedList = prompts.map((item) => (item.id === editingPromptId ? updatedPrompt : item));
        savePromptsToStorage(updatedList);
        showToast("Prompt updated successfully! 🚀");
        if (selected && selected.id === editingPromptId) {
          setSelected(updatedPrompt);
        }
      } else {
        // CREATE new prompt via POST /api/prompts
        const res = await fetch("/api/prompts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        const result = await res.json();
        if (!res.ok || !result.success) {
          showToast(`Error: ${result.error || "Failed to publish prompt"}`);
          return;
        }
        const newPrompt = result.data;
        const newList = [newPrompt, ...prompts];
        savePromptsToStorage(newList);
        showToast("New prompt published to Gallery! 🎉");
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast("Server error saving prompt");
    }
  };

  // Delete Prompt via DELETE /api/prompts/[id]
  const handleDeletePrompt = async (id, e = null) => {
    if (e) e.stopPropagation();
    if (!isAdmin) {
      showToast("Editing access required! Please sign in with ujjwal@gmail.com 🔒");
      return;
    }
    if (confirm("Are you sure you want to remove this prompt from your gallery?")) {
      try {
        const res = await fetch(`/api/prompts/${id}`, { method: "DELETE" });
        const result = await res.json();
        if (!res.ok || !result.success) {
          showToast(`Error: ${result.error || "Failed to delete prompt"}`);
          return;
        }
        const updated = prompts.filter((p) => p.id !== id);
        savePromptsToStorage(updated);
        showToast("Prompt removed from gallery 🗑️");
        if (selected && selected.id === id) {
          setSelected(null);
        }
      } catch (err) {
        showToast("Server error deleting prompt");
      }
    }
  };

  // AI Prompt Enhancer helper
  const enhancePromptText = () => {
    if (!formData.text.trim()) {
      setFormData((prev) => ({
        ...prev,
        text: "A breathtaking landscape shot with cinematic lighting, volumetric atmosphere, octane render, 8k resolution, photorealistic details."
      }));
      showToast("Added sample high-performing prompt template!");
      return;
    }
    const qualityTags = ", highly detailed, 8k resolution, cinematic lighting, photorealistic textures, octane render, 35mm lens, depth of field";
    if (!formData.text.includes("8k resolution")) {
      setFormData((prev) => ({
        ...prev,
        text: prev.text.trim() + qualityTags
      }));
      showToast("Enhanced prompt with high quality parameters! Magic Wand ✨");
    } else {
      showToast("Prompt already includes high quality parameters!");
    }
  };

  // Helper function to auto-resize and compress uploaded images
  const resizeAndCompressImage = (file, maxDimension = 1000, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // Scale down proportionally if larger than maxDimension
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          let resizedDataUrl = canvas.toDataURL("image/webp", quality);
          if (!resizedDataUrl.startsWith("data:image/webp")) {
            resizedDataUrl = canvas.toDataURL("image/jpeg", quality);
          }
          resolve(resizedDataUrl);
        };
        img.onerror = (err) => reject(err);
        img.src = e.target.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Handle local image file upload with automatic resizing
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      showToast("Optimizing & resizing image... ⏳");
      try {
        const resizedUrl = await resizeAndCompressImage(file, 1000, 0.85);
        setFormData((prev) => ({
          ...prev,
          imageUrl: resizedUrl
        }));
        showToast("Image auto-resized & ready! 📷✨");
      } catch (err) {
        showToast("Failed to process image file");
      }
    }
  };

  // Filtered & Sorted prompts
  const filteredPrompts = useMemo(() => {
    return prompts
      .filter((p) => {
        // Tab filtering
        if (activeTab === "my" && !p.isUserCreated) return false;
        if (activeTab === "favs" && !favorites.includes(p.id)) return false;

        // Model & Category filtering
        const matchesModel = model === "All" || p.model === model;
        const matchesCat = cat === "All" || p.cat === cat;

        // Search query
        const queryStr = (p.title + " " + p.text + " " + p.model + " " + p.cat).toLowerCase();
        const matchesSearch = !q || queryStr.includes(q.toLowerCase());

        return matchesModel && matchesCat && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "popular") return b.likes - a.likes;
        if (sortBy === "newest") return b.createdAt - a.createdAt;
        if (sortBy === "title") return a.title.localeCompare(b.title);
        return 0;
      });
  }, [prompts, activeTab, favorites, model, cat, q, sortBy]);

  return (
    <main className="app-container">
      {/* NAVBAR */}
      <nav className="nav">
        <div className="brand" onClick={() => { setActiveTab("all"); setModel("All"); setCat("All"); setQ(""); }}>
          <div className="logo"><Sparkles size={18} /></div>
          <span>Go Viral</span>
        </div>

        {isAdmin && (
          <div className="navlinks">
            <button
              className={`nav-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              <Grid size={15} /> All Gallery ({prompts.length})
            </button>
            <button
              className={`nav-tab ${activeTab === "my" ? "active" : ""}`}
              onClick={() => setActiveTab("my")}
            >
              <Zap size={15} /> My Uploads ({prompts.filter(p => p.isUserCreated).length})
            </button>
            <button
              className={`nav-tab ${activeTab === "favs" ? "active" : ""}`}
              onClick={() => setActiveTab("favs")}
            >
              <Bookmark size={15} /> Favorites ({favorites.length})
            </button>
          </div>
        )}
        <div className="nav-right-actions">
          {!(currentUser && currentUser.isLoggedIn) && (
            <button
              type="button"
              className="nav-signup-left-btn"
              onClick={() => {
                setAuthTab("login");
                setIsAuthModalOpen(true);
              }}
            >
              <UserPlus size={14} /> <span>Sign In / Sign Up</span>
            </button>
          )}

          {currentUser && currentUser.isLoggedIn && (
            <button
              type="button"
              className="user-avatar-btn"
              onClick={() => setIsAuthModalOpen(true)}
              title={`Account Profile: ${currentUser.name}`}
            >
              {userAvatar ? (
                <img src={userAvatar} alt="User Avatar" className="nav-avatar-img" />
              ) : (
                <div className="nav-avatar-placeholder">
                  <User size={18} />
                </div>
              )}
            </button>
          )}

          {isAdmin && (
            <button className="submit" onClick={openCreateModal}>
              <Plus size={16} /> <span>Submit Prompt</span>
            </button>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="eyebrow">AI PROMPT GALLERY & STUDIO</div>
        <h1 className="hero-title-interactive">
          {"Discover & Update".split("").map((char, index) => (
            char === " " ? (
              <span key={index}>&nbsp;</span>
            ) : (
              <span key={index} className="hover-letter">{char}</span>
            )
          ))}
          <br />
          {"Next-Gen AI Prompts".split("").map((char, index) => (
            char === " " ? (
              <span key={index}>&nbsp;</span>
            ) : (
              <span key={index} className="hover-letter">{char}</span>
            )
          ))}
        </h1>
        <p>
          Browse top-performing prompts for Midjourney, FLUX & Stable Diffusion. Create, edit, and publish your own AI prompt creations directly to your gallery.
        </p>

        {/* SEARCH BAR */}
        <div className="search">
          <Search size={20} className="search-icon" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search prompt ideas, camera angles, lighting, styles..."
          />
          {q && (
            <button className="clear-btn" onClick={() => setQ("")}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* MODEL FILTER CHIPS */}
        <div className="chips">
          {MODELS.map((m) => (
            <button
              key={m}
              onClick={() => setModel(m)}
              className={`chip ${model === m ? "active" : ""}`}
            >
              {m}
            </button>
          ))}
        </div>
      </section>

      {/* TOOLBAR FOR FILTERS & SORT */}
      <section className="toolbar">
        {isAdmin ? (
          <div className="toolbar-stats">
            Showing <b>{filteredPrompts.length}</b> {activeTab === "my" ? "created" : activeTab === "favs" ? "favorite" : ""} prompts
            {model !== "All" && <span className="filter-pill">Model: {model}</span>}
            {cat !== "All" && <span className="filter-pill">Category: {cat}</span>}
          </div>
        ) : (
          <div className="toolbar-stats">
            {model !== "All" && <span className="filter-pill">Model: {model}</span>}
            {cat !== "All" && <span className="filter-pill">Category: {cat}</span>}
          </div>
        )}

        <div className="filters">
          <div className="select-wrapper">
            <span className="select-label">Category:</span>
            <select value={cat} onChange={(e) => setCat(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="select-wrapper">
            <span className="select-label">Sort:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="popular">🔥 Most Popular</option>
              <option value="newest">⚡ Recently Added</option>
              <option value="title">🔤 Title A-Z</option>
            </select>
          </div>

          {isAdmin && (
            <button className="add-quick-btn" onClick={openCreateModal} title="Add New Prompt">
              <Plus size={16} /> <span>New Prompt</span>
            </button>
          )}
        </div>
      </section>

      {/* PROMPT GALLERY GRID */}
      {filteredPrompts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Layers size={36} /></div>
          <h3>No Prompts Found</h3>
          <p>
            {activeTab === "my"
              ? "You haven't submitted or updated any prompts yet! Click the button below to add your first prompt."
              : activeTab === "favs"
                ? "No favorites added yet. Click the heart icon on any card to save it here!"
                : "Try adjusting your search query or reset model and category filters."}
          </p>
          {isAdmin && (
            <button className="submit mt-4" onClick={openCreateModal}>
              <Plus size={16} /> Add New Prompt to Gallery
            </button>
          )}
        </div>
      ) : (
        <section className="grid">
          {filteredPrompts.map((p) => {
            const isFav = favorites.includes(p.id);
            return (
              <article className="card image-first-card" key={p.id} onClick={() => setSelected(p)}>
                {/* VISUAL IMAGE DISPLAY */}
                <div className={`visual visual-tall ${p.coverStyle || "v-neon"}`}>
                  {p.imageUrl && p.imageUrl.trim() && (
                    <img
                      key={formatImageUrl(p.imageUrl)}
                      src={formatImageUrl(p.imageUrl)}
                      alt={p.title}
                      referrerPolicy="no-referrer"
                      className="visual-img"
                      onLoad={(e) => {
                        e.currentTarget.style.display = 'block';
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}

                  {/* TOP BADGES & ACTIONS */}
                  <div className="visual-badge">{p.cat}</div>
                  <div className="visual-model-tag">{p.model}</div>

                  <div className="card-top-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className={`icon-btn ${copiedId === p.id ? "copied" : ""}`}
                      onClick={() => handleCopy(p.text, p.id, p.isHtmlMode)}
                      title={p.isHtmlMode ? "Copy Prompt (HTML Mode ON)" : "Copy Prompt Text"}
                    >
                      {copiedId === p.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>

                    <button
                      className={`icon-btn ${isFav ? "liked" : ""}`}
                      onClick={() => toggleFavorite(p.id)}
                      title={isFav ? "Remove Favorite" : "Save Favorite"}
                    >
                      <Heart size={14} fill={isFav ? "currentColor" : "none"} />
                    </button>

                    {isAdmin && (
                      <>
                        <button
                          className="icon-btn edit-icon-btn"
                          title="Update / Edit Prompt"
                          onClick={(e) => openUpdateModal(p, e)}
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          className="icon-btn delete-icon-btn"
                          title="Delete Prompt"
                          onClick={(e) => handleDeletePrompt(p.id, e)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* BOTTOM IMAGE OVERLAY FOOTER */}
                  <div className="image-overlay-footer">
                    <div className="card-title-row">
                      <h3>{p.title}</h3>
                      {isAdmin ? (
                        <div className="likes-stepper-control" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="like-step-btn"
                            title="Decrease Likes"
                            onClick={(e) => handleAdjustLikes(p.id, -1, e)}
                          >
                            -
                          </button>
                          <span className="likes-tag">♥ {p.likes || 0}</span>
                          <button
                            type="button"
                            className="like-step-btn"
                            title="Increase Likes"
                            onClick={(e) => handleAdjustLikes(p.id, 1, e)}
                          >
                            +
                          </button>

                          <div className="prompt-order-arrows">
                            <button
                              type="button"
                              className="order-arrow-btn"
                              title="Move Position Up"
                              onClick={(e) => handleMovePrompt(p.id, "up", e)}
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              className="order-arrow-btn"
                              title="Move Position Down"
                              onClick={(e) => handleMovePrompt(p.id, "down", e)}
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="likes-tag">♥ {p.likes || 0}</span>
                      )}
                    </div>
                    <div className="click-prompt-hint">
                      <Sparkles size={13} /> Click image to reveal prompt
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* PROMPT DETAIL MODAL */}
      {selected && (
        <div className="modalbg" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)}>
              <X size={18} />
            </button>

            {/* LEFT COVER DISPLAY */}
            <div className={`modalvisual ${selected.coverStyle || "v-neon"}`}>
              {selected.imageUrl && selected.imageUrl.trim() && (
                <img
                  key={formatImageUrl(selected.imageUrl)}
                  src={formatImageUrl(selected.imageUrl)}
                  alt={selected.title}
                  referrerPolicy="no-referrer"
                  className="visual-img"
                  onLoad={(e) => {
                    e.currentTarget.style.display = 'block';
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div className="modal-cover-overlay">
                <span className="cat-tag">{selected.cat}</span>
                <span className="model-tag">{selected.model}</span>
              </div>
            </div>

            {/* RIGHT CONTENT */}
            <div className="modalcontent">
              <div className="modal-header-meta">
                <span className="badge-model">{selected.model}</span>
                <span className="badge-cat">{selected.cat}</span>
                <span className="badge-likes">♥ {selected.likes} Likes</span>
              </div>

              <h2>{selected.title}</h2>

              <div className="prompt-container">
                {isAdmin && (
                  <div className="html-mode-pill-bar">
                    <button
                      type="button"
                      className={`html-mode-chip ${selected.isHtmlMode ? "active" : ""}`}
                      onClick={() => {
                        const updatedHtmlMode = !selected.isHtmlMode;
                        const updatedSelected = { ...selected, isHtmlMode: updatedHtmlMode };
                        setSelected(updatedSelected);
                        const updatedPrompts = prompts.map((p) => (p.id === selected.id ? updatedSelected : p));
                        savePromptsToStorage(updatedPrompts);
                        fetch(`/api/prompts/${selected.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "update", promptData: updatedSelected })
                        }).catch(() => {});
                        showToast(updatedHtmlMode ? "HTML Design Mode ON 🟢" : "HTML Design Mode OFF ⚪");
                      }}
                    >
                      <Code size={14} />
                      <span>HTML Mode: {selected.isHtmlMode ? "ON 🟢" : "OFF ⚪"}</span>
                    </button>

                    {selected.isHtmlMode && (
                      <span className="html-mode-prefix-notice">
                        "Make a web design in .html using this prompt"
                      </span>
                    )}
                  </div>
                )}

                <div className="prompt-label">
                  <span>Prompt Text</span>
                  <button className="mini-copy" onClick={() => handleCopy(selected.text, selected.id, selected.isHtmlMode)}>
                    {copiedId === selected.id ? <Check size={13} /> : <Copy size={13} />}
                    {copiedId === selected.id ? " Copied!" : " Copy"}
                  </button>
                </div>
                <p className="prompt">{selected.text}</p>
              </div>

              {selected.negative && (
                <div className="prompt-container negative-container">
                  <div className="prompt-label negative-label">
                    <span>Negative Prompt / Parameters</span>
                    <button className="mini-copy" onClick={() => handleCopy(selected.negative, null, true)}>
                      <Copy size={13} /> Copy
                    </button>
                  </div>
                  <p className="prompt negative-prompt">{selected.negative}</p>
                </div>
              )}

              <div className="modal-action-bar">
                <button className="copybig" onClick={() => handleCopy(selected.text, selected.id)}>
                  <Copy size={17} /> Copy Prompt
                </button>

                {isAdmin && (
                  <button
                    className="editbig"
                    onClick={() => {
                      const pToEdit = selected;
                      setSelected(null);
                      openUpdateModal(pToEdit);
                    }}
                  >
                    <Edit3 size={17} /> Edit / Update Prompt
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE & UPDATE PROMPT MODAL */}
      {isModalOpen && (
        <div className="modalbg" onClick={() => setIsModalOpen(false)}>
          <div className="editor-modal" onClick={(e) => e.stopPropagation()}>
            <div className="editor-header">
              <div className="editor-title">
                <Sparkles className="icon-sparkle" size={20} />
                <h2>{editingPromptId ? "Update Prompt Details" : "Publish New Prompt to Gallery"}</h2>
              </div>
              <button className="close-editor" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePrompt} className="editor-form-grid">
              {/* FORM FIELDS */}
              <div className="form-fields">
                <div className="field-group">
                  <label>Prompt Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cyberpunk Neon Samurai Portrait"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="field-row">
                  <div className="field-group">
                    <label>AI Model</label>
                    <select
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    >
                      {MODELS.filter((m) => m !== "All").map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field-group">
                    <label>Category</label>
                    <select
                      value={formData.cat}
                      onChange={(e) => setFormData({ ...formData, cat: e.target.value })}
                    >
                      {CATEGORIES.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field-group">
                  <div className="label-with-action">
                    <label>Prompt Text *</label>
                    <button
                      type="button"
                      className="enhance-btn"
                      onClick={enhancePromptText}
                      title="Append high quality parameters like 8k, raytracing & lighting"
                    >
                      <Wand2 size={13} /> Magic Enhancer
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your prompt in detail... e.g. Ultra realistic cinematic photograph..."
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  />
                </div>

                <div className="field-group">
                  <label>Negative Prompt / Parameters (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. --ar 16:9 --v 6.0, blurry, low resolution, extra fingers"
                    value={formData.negative}
                    onChange={(e) => setFormData({ ...formData, negative: e.target.value })}
                  />
                </div>

                {/* LIKES & POPULARITY SCORE */}
                <div className="field-group">
                  <label>Likes / Popularity Score</label>
                  <div className="likes-field-stepper">
                    <button
                      type="button"
                      className="stepper-action-btn"
                      onClick={() => setFormData({ ...formData, likes: Math.max(0, (formData.likes || 0) - 1) })}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={formData.likes || 0}
                      onChange={(e) => setFormData({ ...formData, likes: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      style={{ textAlign: "center", fontWeight: "700" }}
                    />
                    <button
                      type="button"
                      className="stepper-action-btn"
                      onClick={() => setFormData({ ...formData, likes: (formData.likes || 0) + 1 })}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* HTML WEB DESIGN MODE TOGGLE (ON / OFF) */}
                <div className="field-group">
                  <div className="html-mode-toggle-label">
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Code size={16} style={{ color: "#ff1e00" }} />
                      HTML Web Design Mode
                    </span>
                    <button
                      type="button"
                      className={`html-toggle-btn ${formData.isHtmlMode ? "on" : "off"}`}
                      onClick={() => setFormData({ ...formData, isHtmlMode: !formData.isHtmlMode })}
                    >
                      {formData.isHtmlMode ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      <span>{formData.isHtmlMode ? "ON 🟢" : "OFF ⚪"}</span>
                    </button>
                  </div>
                  <p className="field-help-text">
                    {formData.isHtmlMode ? (
                      <span className="html-status-active">
                        ✅ <strong>HTML Mode ON:</strong> When copied, automatically prepends: <code>"Make a web design in .html using this prompt"</code>
                      </span>
                    ) : (
                      <span className="html-status-inactive">
                        ⚡ <strong>HTML Mode OFF:</strong> Copies standard raw prompt text without prefix.
                      </span>
                    )}
                  </p>
                </div>

                {/* COVER STYLE & IMAGE SELECTOR */}
                <div className="field-group">
                  <label>Card Visual Background Style</label>
                  <div className="visual-picker">
                    {VISUAL_THEMES.map((theme) => (
                      <button
                        type="button"
                        key={theme.id}
                        onClick={() => setFormData({ ...formData, coverStyle: theme.id, imageUrl: "" })}
                        className={`visual-option ${theme.id} ${formData.coverStyle === theme.id && !formData.imageUrl ? "selected" : ""}`}
                      >
                        <span>{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field-group">
                  <label>Or Custom Image (URL or Upload File)</label>
                  <div className="image-input-row">
                    <input
                      type="text"
                      placeholder="Paste image URL (https://... or data:image/...)"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                    <label className="upload-btn-label">
                      <Upload size={14} /> Upload
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                    </label>
                  </div>

                  {/* SAMPLE IMAGE PRESET BUTTONS */}
                  <div className="sample-presets">
                    <span className="sample-label">Try sample:</span>
                    <button
                      type="button"
                      className="preset-pill"
                      onClick={() => setFormData({ ...formData, imageUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop" })}
                    >
                      🌆 Cyberpunk
                    </button>
                    <button
                      type="button"
                      className="preset-pill"
                      onClick={() => setFormData({ ...formData, imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop" })}
                    >
                      ⚔️ Samurai
                    </button>
                    <button
                      type="button"
                      className="preset-pill"
                      onClick={() => setFormData({ ...formData, imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop" })}
                    >
                      ✨ Neon Portrait
                    </button>
                    <button
                      type="button"
                      className="preset-pill"
                      onClick={() => setFormData({ ...formData, imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop" })}
                    >
                      🏛️ Architecture
                    </button>
                  </div>

                  {formData.imageUrl && (
                    <div className="image-status-bar">
                      <span>✓ Image URL loaded</span>
                      <button
                        type="button"
                        className="remove-img-btn"
                        onClick={() => setFormData({ ...formData, imageUrl: "" })}
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* LIVE CARD PREVIEW COLUMN */}
              <div className="preview-column">
                <div className="preview-label">
                  <Info size={14} /> Live Gallery Card Preview
                </div>

                <div className="card preview-card">
                  <div className={`visual ${formData.coverStyle || "v-neon"}`}>
                    {formData.imageUrl && formData.imageUrl.trim() && (
                      <img
                        key={formatImageUrl(formData.imageUrl)}
                        src={formatImageUrl(formData.imageUrl)}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="visual-img"
                        onLoad={(e) => {
                          e.currentTarget.style.display = 'block';
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="visual-badge">{formData.cat}</div>
                    <div className="visual-model-tag">{formData.model}</div>
                  </div>

                  <div className="cardbody">
                    <div className="meta">
                      <span className="model-name">{formData.model}</span>
                      <span className="likes-count">♥ New</span>
                    </div>
                    <h3>{formData.title || "Untitled Prompt"}</h3>
                    <p>{formData.text || "Your prompt preview text will appear here as you type..."}</p>
                    <div className="actions">
                      <button type="button" disabled><Copy size={14} /> Copy</button>
                      <button type="button" disabled><Heart size={14} /></button>
                    </div>
                  </div>
                </div>

                <div className="form-submit-actions">
                  <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-submit-btn">
                    <Sparkles size={16} />
                    {editingPromptId ? "Update Prompt" : "Publish to Gallery"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER LOGIN & ACCOUNT MODAL */}
      {isAuthModalOpen && (
        <div className="modalbg" onClick={() => setIsAuthModalOpen(false)}>
          {currentUser && currentUser.isLoggedIn ? (
            /* LUXURY REDESIGNED USER PROFILE VIEW */
            <div className="auth-modal profile-modal-styled" onClick={(e) => e.stopPropagation()}>
              <div className="profile-modal-header">
                <button className="profile-close-btn" onClick={() => setIsAuthModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              {/* COVER BANNER */}
              <div className="profile-cover-banner">
                <div className="profile-cover-badge">
                  <Sparkles size={12} /> {currentUser.role || "Admin & Creator"}
                </div>
              </div>

              {/* AVATAR CIRCLE */}
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar-box">
                  {userAvatar ? (
                    <img src={userAvatar} alt="Avatar Preview" className="profile-avatar-img" />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      <User size={48} />
                    </div>
                  )}
                  <label className="profile-avatar-camera-btn" title="Upload Photo">
                    <Camera size={14} />
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: "none" }} />
                  </label>
                </div>
              </div>

              {/* IDENTITY */}
              <div className="profile-identity-section">
                <h3 className="profile-user-name">{currentUser.name}</h3>
                <p className="profile-user-email">{currentUser.email}</p>
              </div>

              {/* CREATOR STATS ROW */}
              <div className="profile-stats-row">
                <div className="profile-stat-card">
                  <span className="profile-stat-num">{prompts.length}</span>
                  <span className="profile-stat-label">Prompts</span>
                </div>
                <div className="profile-stat-card">
                  <span className="profile-stat-num">{prompts.filter(p => p.isUserCreated).length}</span>
                  <span className="profile-stat-label">My Uploads</span>
                </div>
                <div className="profile-stat-card">
                  <span className="profile-stat-num">{favorites.length}</span>
                  <span className="profile-stat-label">Favorites</span>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="profile-footer-actions">
                {userAvatar && (
                  <button
                    type="button"
                    className="profile-remove-btn"
                    onClick={() => saveUserAvatar("")}
                  >
                    <Trash2 size={13} /> Remove Photo
                  </button>
                )}

                <button type="button" className="profile-logout-btn" onClick={handleLogout}>
                  <LogOut size={15} /> Log Out / Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* SPLIT SCREEN DESIGN AUTH MODAL (MATCHING REFERENCE UI) */
            <div className="auth-split-modal" onClick={(e) => e.stopPropagation()}>
              {/* LEFT ARTWORK SHOWCASE PANEL WITH DYNAMIC 2s INFINITE LOOP SLIDE ANIMATION */}
              <div className="auth-art-card">
                {/* SLIDER TRACK FOR INFINITE SEAMLESS LOOP ANIMATION */}
                <div
                  className="auth-art-slider-track"
                  style={{
                    transform: `translateX(-${authSlideIndex * 100}%)`,
                    transition: isSlideTransitioning ? "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)" : "none"
                  }}
                >
                  {LOOP_SLIDES.map((imgItem, idx) => {
                    const isActive = totalImagesCount > 0 && (idx % totalImagesCount) === realSlideIndex;
                    return (
                      <div key={`${imgItem.id}-${idx}`} className={`auth-art-slide ${isActive ? "active" : ""}`}>
                        <img src={imgItem.src} alt={imgItem.title} className="auth-art-slide-img" />
                      </div>
                    );
                  })}
                </div>

                <div className="auth-art-card-overlay"></div>

                <div className="auth-art-top-bar">
                  <div className="auth-art-title-container">
                    <span className="auth-art-title">
                      {profileImages[realSlideIndex]?.title || "Selected Works"}
                    </span>
                    {/* PAGINATION DOTS */}
                    <div className="auth-art-dots">
                      {profileImages.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          type="button"
                          className={`auth-art-dot ${dotIdx === realSlideIndex ? "active" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsSlideTransitioning(true);
                            setAuthSlideIndex(dotIdx);
                          }}
                          aria-label={`Go to slide ${dotIdx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="auth-art-actions">
                    <button type="button" className="auth-art-pill-btn" onClick={() => setAuthTab("signup")}>Sign Up</button>
                    <button type="button" className="auth-art-pill-btn" onClick={() => setAuthTab("signup")}>Join Us</button>
                  </div>
                </div>

                <div className="auth-art-bottom-bar">
                  <div className="auth-creator-badge">
                    <img
                      src={profileImages[realSlideIndex]?.src || ""}
                      alt={profileImages[realSlideIndex]?.creator || "Ujjwal Prompt"}
                      className="auth-creator-avatar"
                    />
                    <div className="auth-creator-info">
                      <h4>{profileImages[realSlideIndex]?.creator || "Ujjwal Prompt"}</h4>
                      <p>{profileImages[realSlideIndex]?.role || "UI & Prompt Studio"}</p>
                    </div>
                  </div>

                  <div className="auth-art-arrows">
                    <button type="button" className="auth-arrow-circle" onClick={handlePrevAuthSlide} aria-label="Previous image">
                      <ChevronLeft size={16} />
                    </button>
                    <button type="button" className="auth-arrow-circle" onClick={(e) => { if (e) e.stopPropagation(); handleNextAuthSlide(); }} aria-label="Next image">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT CLEAN AUTH FORM PANEL */}
              <div className="auth-form-panel">
                <div>
                  <div className="auth-form-top-nav">
                    <div className="auth-brand-logo-text">
                      <div className="logo"><Sparkles size={16} /></div>
                      <span>GO VIRAL</span>
                    </div>

                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <div className="auth-lang-pill">
                        <Globe size={13} /> <span>EN ▾</span>
                      </div>
                      <button className="profile-close-btn" style={{ position: "relative", top: 0, right: 0 }} onClick={() => setIsAuthModalOpen(false)}>
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="auth-form-header">
                    <h2>{authTab === "login" ? "Hi Creator" : "Create Account"}</h2>
                    <p>{authTab === "login" ? "Welcome back to Go Viral" : "Join the AI Prompt Studio community"}</p>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="auth-form">
                    {authTab === "signup" && (
                      <div className="auth-input-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={authForm.name}
                          onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                          required
                        />
                      </div>
                    )}

                    <div className="auth-input-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={authForm.email}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAuthForm({ ...authForm, email: val });
                          if (authTab === "signup") {
                            validateEmailRealtime(val);
                          }
                        }}
                        onBlur={() => {
                          if (authTab === "signup" && authForm.email) {
                            validateEmailRealtime(authForm.email);
                          }
                        }}
                        required
                      />

                      {authTab === "signup" && (emailValidation.message || emailValidation.isValidating) && (
                        <div className={`email-validation-badge ${emailValidation.isValidating ? "checking" : emailValidation.isValid ? "valid" : "invalid"
                          }`}>
                          {emailValidation.isValidating ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : emailValidation.isValid ? (
                            <CheckCircle2 size={13} />
                          ) : (
                            <AlertCircle size={13} />
                          )}
                          <span>{emailValidation.message}</span>
                        </div>
                      )}
                    </div>

                    <div className="auth-input-group">
                      <label>Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={authForm.password}
                        onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                        required
                      />
                    </div>

                    <div className="auth-divider-line">
                      <span>or</span>
                    </div>

                    <button type="button" className="google-auth-btn" onClick={handleGuestLogin}>
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Continue with Google</span>
                    </button>

                    <button type="submit" className="auth-submit-btn" style={{ marginTop: "16px" }}>
                      <Sparkles size={16} />
                      {authTab === "login" ? "Sign In to Account" : "Create Free Account"}
                    </button>
                  </form>

                  <div className="auth-switch-prompt">
                    {authTab === "login" ? (
                      <>
                        Don't have an account?
                        <button type="button" className="auth-switch-link" onClick={() => setAuthTab("signup")}>
                          Sign Up
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?
                        <button type="button" className="auth-switch-link" onClick={() => setAuthTab("login")}>
                          Sign In
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="auth-social-footer">
                  <div className="auth-social-icon" title="Facebook">f</div>
                  <div className="auth-social-icon" title="Twitter">t</div>
                  <div className="auth-social-icon" title="LinkedIn">in</div>
                  <div className="auth-social-icon" title="Instagram">ig</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}