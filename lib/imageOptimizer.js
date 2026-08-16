/**
 * Automatic Image Optimizer Module for PromptVerse
 * Classifies image aspect ratios, resizes without distortion/upscaling,
 * preserves alpha transparency, converts to WebP (80-85% quality),
 * generates responsive srcset breakpoints & HTML snippets.
 */

/**
 * Format bytes into human-readable strings (KB / MB)
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return "0 Bytes";
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Detect image classification based on aspect ratio (w/h)
 * Rules:
 * aspectRatio >= 2.4            = Banner
 * 0.92 <= aspectRatio <= 1.08   = Square
 * aspectRatio < 0.90            = Portrait
 * 0.90 <= aspectRatio < 2.4     = Landscape (excluding 0.92 - 1.08 Square range)
 */
export function classifyAspectRatio(width, height) {
  if (!width || !height || height === 0) {
    return {
      type: "square",
      label: "Square",
      badge: "Square ⬛",
      icon: "⬛",
      aspectRatio: 1.0,
      aspectRatioStr: "1:1",
      maxW: 1200,
      maxH: 1200
    };
  }

  const ratio = width / height;
  const ratioStr = ratio >= 1 ? `${ratio.toFixed(2)}:1` : `1:${(1 / ratio).toFixed(2)}`;

  // 1. Square check: 0.92 <= ratio <= 1.08
  if (ratio >= 0.92 && ratio <= 1.08) {
    return {
      type: "square",
      label: "Square",
      badge: "Square ⬛",
      icon: "⬛",
      aspectRatio: ratio,
      aspectRatioStr: ratioStr,
      maxW: 1200,
      maxH: 1200
    };
  }

  // 2. Banner check: ratio >= 2.4
  if (ratio >= 2.4) {
    return {
      type: "banner",
      label: "Banner",
      badge: "Banner 🚩",
      icon: "🚩",
      aspectRatio: ratio,
      aspectRatioStr: ratioStr,
      maxW: 1600,
      maxH: 1600
    };
  }

  // 3. Portrait check: ratio < 0.90
  if (ratio < 0.90) {
    return {
      type: "portrait",
      label: "Portrait",
      badge: "Portrait 📱",
      icon: "📱",
      aspectRatio: ratio,
      aspectRatioStr: ratioStr,
      maxW: 1080,
      maxH: 1600
    };
  }

  // 4. Landscape check: 0.90 <= ratio < 2.4 (outside Square bounds)
  return {
    type: "landscape",
    label: "Landscape",
    badge: "Landscape 🖼️",
    icon: "🖼️",
    aspectRatio: ratio,
    aspectRatioStr: ratioStr,
    maxW: 1600,
    maxH: 1600
  };
}

/**
 * Calculate scaled dimensions respecting max limits and preventing upscaling
 * Preserves exact original aspect ratio mathematically.
 */
export function calculateTargetDimensions(origW, origH, category) {
  const ratio = origW / origH;

  let maxW = category.maxW;
  let maxH = category.maxH;

  // Never upscale smaller images
  if (origW <= maxW && origH <= maxH) {
    return { width: origW, height: origH };
  }

  // Calculate scale factor downscale
  let targetW = origW;
  let targetH = origH;

  if (category.type === "portrait") {
    // max height = 1600px, max width = 1080px
    const scaleFactor = Math.min(maxW / origW, maxH / origH);
    targetW = Math.round(origW * scaleFactor);
    targetH = Math.round(origH * scaleFactor);
  } else if (category.type === "square") {
    // max width = 1200px, max height = 1200px
    const scaleFactor = Math.min(maxW / origW, maxH / origH);
    targetW = Math.round(origW * scaleFactor);
    targetH = Math.round(origH * scaleFactor);
  } else {
    // Landscape & Banner: max width = 1600px
    const scaleFactor = maxW / origW;
    targetW = maxW;
    targetH = Math.round(origH * scaleFactor);
  }

  return { width: targetW, height: targetH };
}

/**
 * Convert canvas drawing to WebP format DataURL with quality setting (default 82%)
 */
export function canvasToDataUrl(canvas, preferredFormat = "image/webp", quality = 0.82) {
  try {
    let dataUrl = canvas.toDataURL(preferredFormat, quality);
    if (!dataUrl.startsWith(`data:${preferredFormat}`)) {
      dataUrl = canvas.toDataURL("image/jpeg", quality);
    }
    return dataUrl;
  } catch (err) {
    return canvas.toDataURL("image/png");
  }
}

/**
 * Approximate byte size of base64 DataURL string
 */
export function getDataUrlSizeBytes(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string") return 0;
  const base64Str = dataUrl.split(",")[1] || dataUrl;
  return Math.round((base64Str.length * 3) / 4);
}

/**
 * Generate Responsive HTML snippet string for WebP images
 */
export function generateResponsiveHtmlSnippet(mainFileName, responsiveSizes, altText = "") {
  const srcsetItems = [];
  const bps = Object.keys(responsiveSizes).map(Number).sort((a, b) => a - b);

  for (const bp of bps) {
    const item = responsiveSizes[bp];
    const bpFileName = mainFileName.replace(/\.webp$/i, `-${bp}w.webp`);
    srcsetItems.push(`${bpFileName} ${bp}w`);
  }

  const srcSetAttr = srcsetItems.length > 0 ? srcsetItems.join(",\n    ") : `${mainFileName} 800w`;

  return `<img
  src="${mainFileName}"
  srcset="
    ${srcSetAttr}
  "
  sizes="100vw"
  loading="lazy"
  decoding="async"
  alt="${altText || "Optimized WebP Image"}"
>`;
}

/**
 * Automatically fetch, resize, compress, and generate WebP + thumbnail for any HTTP/HTTPS image URL
 */
export async function optimizeImageUrl(imageUrl, options = {}) {
  if (!imageUrl || typeof imageUrl !== "string") {
    throw new Error("Invalid image URL provided");
  }

  const cleanUrl = imageUrl.trim();
  if (!cleanUrl) {
    throw new Error("Image URL cannot be empty");
  }

  // If already a base64 DataURL, pass directly to optimizeImageFile
  if (cleanUrl.startsWith("data:image/")) {
    return await optimizeImageFile(cleanUrl, options);
  }

  // Fetch image via backend proxy route to bypass browser CORS restrictions
  const response = await fetch("/api/optimize-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: cleanUrl })
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || "Failed to fetch and optimize remote image URL");
  }

  // Generate clean custom filename from URL path if not provided
  let urlName = "url_image";
  try {
    const parsed = new URL(cleanUrl);
    const pathname = parsed.pathname;
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      const last = segments[segments.length - 1];
      urlName = last.split(".")[0] || "url_image";
    }
  } catch (e) {}

  return await optimizeImageFile(result.dataUrl, {
    ...options,
    customName: options.customName || urlName
  });
}

/**
 * Main Automatic Image Optimizer
 * Accepts a File, Blob, or DataURL string
 * Returns complete optimization report, previews, responsive breakpoints & HTML output
 */
export async function optimizeImageFile(fileOrUrl, options = {}) {
  const {
    quality = 0.82,
    preferredFormat = "image/webp",
    generateResponsive = true,
    customName = null
  } = options;

  if (typeof window === "undefined") {
    throw new Error("Client side canvas optimization requires browser window environment.");
  }

  // 1. Input Validation & Error Handling
  if (!fileOrUrl) {
    throw new Error("No image file provided. Please select or drag an image.");
  }

  let origSize = 0;
  let rawName = "optimized_image";
  let imageSrc = "";

  if (fileOrUrl instanceof File || fileOrUrl instanceof Blob) {
    origSize = fileOrUrl.size;
    if (fileOrUrl.name) {
      rawName = fileOrUrl.name.replace(/\.[^/.]+$/, "");
    }
    
    // Check file MIME type
    if (fileOrUrl.type && !fileOrUrl.type.startsWith("image/")) {
      throw new Error(`Invalid file type "${fileOrUrl.type || "unknown"}". Please upload an image file (PNG, JPG, WebP, GIF, AVIF).`);
    }

    // Check size limit (max 50MB)
    if (origSize > 52428800) {
      throw new Error("Image file exceeds maximum supported size limit of 50MB.");
    }

    imageSrc = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error("Failed to read image file. File may be corrupted."));
      reader.readAsDataURL(fileOrUrl);
    });
  } else if (typeof fileOrUrl === "string") {
    imageSrc = fileOrUrl;
    origSize = getDataUrlSizeBytes(fileOrUrl);
  } else {
    throw new Error("Invalid image source type provided.");
  }

  // 2. Load HTML Image Element
  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = "anonymous";
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Failed to decode image data. Format may be corrupted or unsupported."));
    el.src = imageSrc;
  });

  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  if (!origW || !origH) {
    throw new Error("Image has invalid or zero dimensions.");
  }

  // 3. Detect Aspect Ratio & Classify (Portrait, Square, Landscape, Banner)
  const category = classifyAspectRatio(origW, origH);

  // 4. Calculate Final Target Dimensions (No upscaling, preserve exact AR)
  const target = calculateTargetDimensions(origW, origH, category);

  // 5. Draw & Compress on Canvas with Transparency Preservation
  const canvas = document.createElement("canvas");
  canvas.width = target.width;
  canvas.height = target.height;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, target.width, target.height); // Preserve transparency!
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, target.width, target.height);

  const mainDataUrl = canvasToDataUrl(canvas, preferredFormat, quality);
  const mainSizeBytes = getDataUrlSizeBytes(mainDataUrl);

  // 6. Generate Dedicated Optimized Thumbnail Image Version (max 250px)
  const thumbMax = 250;
  const thumbScale = Math.min(1, Math.min(thumbMax / origW, thumbMax / origH));
  const thumbW = Math.round(origW * thumbScale);
  const thumbH = Math.round(origH * thumbScale);

  const thumbCanvas = document.createElement("canvas");
  thumbCanvas.width = thumbW;
  thumbCanvas.height = thumbH;
  const thumbCtx = thumbCanvas.getContext("2d");
  thumbCtx.clearRect(0, 0, thumbW, thumbH); // Preserve transparency
  thumbCtx.imageSmoothingEnabled = true;
  thumbCtx.imageSmoothingQuality = "high";
  thumbCtx.drawImage(img, 0, 0, thumbW, thumbH);

  const thumbDataUrl = canvasToDataUrl(thumbCanvas, preferredFormat, quality);
  const thumbSizeBytes = getDataUrlSizeBytes(thumbDataUrl);

  // 7. Calculate Savings Percentage
  const bytesSaved = Math.max(0, origSize - mainSizeBytes);
  const percentSaved = origSize > 0 ? Math.round((bytesSaved / origSize) * 100) : 0;

  // 8. Generate Responsive Breakpoint Versions (400px, 800px, 1200px, 1600px)
  // Never generate a version larger than original image's width
  const responsiveBreakpoints = [400, 800, 1200, 1600];
  const responsiveSizes = {};

  if (generateResponsive) {
    for (const bp of responsiveBreakpoints) {
      if (origW < bp) {
        // Skip generating breakpoint larger than original width
        continue;
      }

      let bpW = bp;
      let bpH = Math.round(bp / (origW / origH));

      // Don't upscale
      if (bpW > target.width) {
        bpW = target.width;
        bpH = target.height;
      }

      const bpCanvas = document.createElement("canvas");
      bpCanvas.width = bpW;
      bpCanvas.height = bpH;
      const bpCtx = bpCanvas.getContext("2d");
      bpCtx.clearRect(0, 0, bpW, bpH); // Preserve transparency
      bpCtx.imageSmoothingEnabled = true;
      bpCtx.imageSmoothingQuality = "high";
      bpCtx.drawImage(img, 0, 0, bpW, bpH);

      const bpUrl = canvasToDataUrl(bpCanvas, preferredFormat, quality);
      responsiveSizes[bp] = {
        width: bpW,
        height: bpH,
        dataUrl: bpUrl,
        sizeBytes: getDataUrlSizeBytes(bpUrl)
      };
    }
  }

  // Generate standardized WebP filename
  const cleanExt = preferredFormat.includes("webp") ? "webp" : "jpg";
  const sanitizedName = (customName || rawName).toLowerCase().replace(/[^a-z0-9_-]/g, "_");
  const mainFileName = `${sanitizedName}-${category.type}-${target.width}w.${cleanExt}`;
  const thumbFileName = `${sanitizedName}-thumb-${thumbW}w.${cleanExt}`;

  // 9. Generate Responsive HTML Snippet
  const responsiveHtml = generateResponsiveHtmlSnippet(mainFileName, responsiveSizes, rawName);

  return {
    fileName: mainFileName,
    category,
    originalPreview: imageSrc,
    original: {
      width: origW,
      height: origH,
      sizeBytes: origSize,
      sizeFormatted: formatBytes(origSize)
    },
    optimized: {
      width: target.width,
      height: target.height,
      sizeBytes: mainSizeBytes,
      sizeFormatted: formatBytes(mainSizeBytes),
      dataUrl: mainDataUrl,
      format: preferredFormat
    },
    thumbnail: {
      width: thumbW,
      height: thumbH,
      sizeBytes: thumbSizeBytes,
      sizeFormatted: formatBytes(thumbSizeBytes),
      dataUrl: thumbDataUrl,
      fileName: thumbFileName
    },
    percentSaved,
    bytesSaved,
    bytesSavedFormatted: formatBytes(bytesSaved),
    responsiveSizes,
    responsiveHtml
  };
}
