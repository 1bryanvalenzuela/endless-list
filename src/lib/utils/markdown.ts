import { marked, type Tokens } from "marked";
import DOMPurify from "dompurify";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";

// In-memory cache for local images converted to Blob URLs
const blobCache = new Map<string, string>();

function getMimeType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "svg":
      return "image/svg+xml";
    case "bmp":
      return "image/bmp";
    case "ico":
      return "image/x-icon";
    default:
      return "image/jpeg";
  }
}

/**
 * Checks if a string represents a local filesystem path.
 */
export function isLocalPath(src: string): boolean {
  if (!src) return false;
  if (/^(https?:\/\/|data:|blob:|asset:\/\/|http:\/\/asset\.localhost)/i.test(src)) {
    return false;
  }
  return src.startsWith("/") || src.startsWith("file://") || /^[a-zA-Z]:[\\/]/.test(src);
}

/**
 * Loads a local image file through Tauri's binary command and creates an in-origin Blob URL.
 * Completely immune to WebKitGTK cross-origin or custom protocol restrictions on Linux.
 */
export async function getLocalImageBlobUrl(path: string): Promise<string> {
  let cleanPath = path;
  if (cleanPath.startsWith("file://")) {
    cleanPath = cleanPath.slice(7);
  }

  if (blobCache.has(cleanPath)) {
    return blobCache.get(cleanPath)!;
  }

  try {
    const bytes = await invoke<number[] | Uint8Array>("read_file_binary", {
      path: cleanPath,
    });
    const uint8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    const blob = new Blob([uint8 as BlobPart], { type: getMimeType(cleanPath) });
    const blobUrl = URL.createObjectURL(blob);
    blobCache.set(cleanPath, blobUrl);
    return blobUrl;
  } catch (error) {
    console.error("Failed to load local image binary:", cleanPath, error);
    throw error;
  }
}

/**
 * Resolves a local or remote image path to a valid webview URL.
 * Converts local filesystem paths (/home/..., file://..., C:\...) to Tauri's asset: protocol or cached Blob URL.
 */
export function resolveImageSrc(src: string): string {
  if (!src) return src;

  let cleanPath = src;
  if (cleanPath.startsWith("file://")) {
    cleanPath = cleanPath.slice(7);
  }

  // Check if we already have a cached Blob URL for this local file
  if (blobCache.has(cleanPath)) {
    return blobCache.get(cleanPath)!;
  }

  // If already an online URL, data URI, blob, or asset protocol URL, leave untouched
  if (/^(https?:\/\/|data:|blob:|asset:\/\/|http:\/\/asset\.localhost)/i.test(src)) {
    return src;
  }

  // If running in Tauri, try asset protocol as initial source
  try {
    if (typeof window !== "undefined") {
      return convertFileSrc(cleanPath);
    }
  } catch (e) {
    console.warn("Failed to convert file src:", e);
  }

  return src;
}

// Configure marked options for GFM support and custom image renderer
marked.setOptions({
  gfm: true,
  breaks: true,
});

marked.use({
  renderer: {
    image({ href, title, text }: Tokens.Image) {
      const resolvedHref = resolveImageSrc(href);
      const titleAttr = title ? ` title="${title}"` : "";
      const altAttr = text ? ` alt="${text}"` : "";
      const localAttr = isLocalPath(href) ? ` data-local-src="${href}"` : "";
      return `<img src="${resolvedHref}"${altAttr}${titleAttr}${localAttr} />`;
    },
  },
});

/**
 * Parses markdown text to sanitized HTML with local asset and blob support.
 */
export function renderMarkdown(content: string): string {
  if (!content || !content.trim()) return "";

  const rawHtml = marked.parse(content) as string;
  return DOMPurify.sanitize(rawHtml, {
    ADD_ATTR: ["target", "data-local-src"],
    ADD_TAGS: ["img"],
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|asset|blob):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}
