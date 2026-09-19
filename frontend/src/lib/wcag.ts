/**
 * Utility functions for WCAG 2.1 color contrast calculation
 */

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length === 3) {
    const c0 = cleanHex.charAt(0);
    const c1 = cleanHex.charAt(1);
    const c2 = cleanHex.charAt(2);
    return {
      r: parseInt(c0 + c0, 16),
      g: parseInt(c1 + c1, 16),
      b: parseInt(c2 + c2, 16),
    };
  }
  if (cleanHex.length === 6) {
    return {
      r: parseInt(cleanHex.slice(0, 2), 16),
      g: parseInt(cleanHex.slice(2, 4), 16),
      b: parseInt(cleanHex.slice(4, 6), 16),
    };
  }
  return null;
}

function getChannelLuminance(value: number): number {
  const v = value / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const r = getChannelLuminance(rgb.r);
  const g = getChannelLuminance(rgb.g);
  const b = getChannelLuminance(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 10) / 10;
}

export function getWcagCompliance(ratio: number): {
  badgeText: string;
  isPass: boolean;
  level: "AAA" | "AA" | "FAIL";
  colorClass: string;
} {
  if (ratio >= 7.0) {
    return {
      badgeText: `WCAG AAA (${ratio}:1)`,
      isPass: true,
      level: "AAA",
      colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }
  if (ratio >= 4.5) {
    return {
      badgeText: `WCAG AA (${ratio}:1)`,
      isPass: true,
      level: "AA",
      colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }
  if (ratio >= 3.0) {
    return {
      badgeText: `WCAG AA Large (${ratio}:1)`,
      isPass: true,
      level: "AA",
      colorClass: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }
  return {
    badgeText: `Low Contrast (${ratio}:1)`,
    isPass: false,
    level: "FAIL",
    colorClass: "bg-rose-50 text-rose-700 border-rose-200",
  };
}
