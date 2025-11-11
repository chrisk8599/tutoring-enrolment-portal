/**
 * Capitalizes the first letter of each word
 * Example: "john smith" -> "John Smith"
 */
export const capitalizeWords = (str) => {
  if (!str) return "";
  return str
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Converts email to lowercase
 * Example: "John@EMAIL.com" -> "john@email.com"
 */
export const lowercaseEmail = (str) => {
  if (!str) return "";
  return str.trim().toLowerCase();
};

/**
 * Validates Australian mobile number format
 * Accepts: 0412345678, +61412345678, 04 1234 5678, etc.
 */
export const validateMobile = (mobile) => {
  // Remove all spaces and special characters except +
  const cleaned = mobile.replace(/[\s()-]/g, "");

  // Check for Australian mobile patterns
  const patterns = [
    /^04\d{8}$/, // 0412345678
    /^\+614\d{8}$/, // +61412345678
    /^614\d{8}$/, // 61412345678
  ];

  return patterns.some((pattern) => pattern.test(cleaned));
};

/**
 * Formats mobile number to consistent format
 * Converts to: +61 4XX XXX XXX
 */
export const formatMobile = (mobile) => {
  // Remove all spaces and special characters
  let cleaned = mobile.replace(/[\s()-]/g, "");

  // Convert to international format if needed
  if (cleaned.startsWith("0")) {
    cleaned = "+61" + cleaned.slice(1);
  } else if (cleaned.startsWith("61") && !cleaned.startsWith("+61")) {
    cleaned = "+" + cleaned;
  } else if (!cleaned.startsWith("+")) {
    cleaned = "+61" + cleaned;
  }

  // Format as +61 4XX XXX XXX
  if (cleaned.startsWith("+614")) {
    return cleaned.replace(/(\+61)(\d{3})(\d{3})(\d{3})/, "$1 $2 $3 $4");
  }

  return cleaned;
};
