import { SLOTS } from "./slots";

/**
 * Tracks changes between original and personalized content by analyzing data-slot elements
 * and comparing their original vs. new values.
 */
export function trackChanges(originalHtml, slotJson) {
  const changes = {};

  SLOTS.forEach((slot) => {
    if (slotJson[slot]) {
      // Find the original value in the HTML using data-slot attribute
      const regex = new RegExp(
        `<[^>]+data-slot="${slot}"[^>]*>([^<]*?)(?=<)`,
        "i"
      );
      const match = originalHtml.match(regex);
      const originalValue = match ? match[1].trim() : "[empty]";
      const newValue = slotJson[slot].trim();

      // Only track if there's an actual change
      if (originalValue !== newValue && newValue) {
        changes[slot] = {
          from: originalValue,
          to: newValue,
          category: categorizeSlot(slot),
        };
      }
    }
  });

  return changes;
}

/**
 * Categorizes a slot name for better organization in the UI
 */
function categorizeSlot(slot) {
  if (slot.includes("hero")) return "Hero Section";
  if (slot.includes("stat")) return "Stats Section";
  if (slot.includes("benefit")) return "Benefits Section";
  if (slot.includes("step")) return "How It Works";
  if (slot.includes("testimonial")) return "Testimonials";
  if (slot.includes("pricing")) return "Pricing";
  if (slot.includes("faq")) return "FAQ";
  if (slot.includes("cta") || slot.includes("button")) return "Call to Action";
  if (slot.includes("nav")) return "Navigation";
  return "Other";
}

/**
 * Generates a summary of changes by category
 */
export function generateChangeSummary(changes) {
  const summary = {};

  Object.entries(changes).forEach(([slot, change]) => {
    const category = change.category;
    if (!summary[category]) {
      summary[category] = [];
    }
    summary[category].push({ slot, ...change });
  });

  return summary;
}

/**
 * Creates a user-friendly change description
 */
export function createChangeDescription(changes) {
  const count = Object.keys(changes).length;
  if (count === 0) return "No changes detected";
  if (count === 1) return "1 element personalized";
  return `${count} elements personalized`;
}
