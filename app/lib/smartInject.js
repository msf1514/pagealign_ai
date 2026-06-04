import * as cheerio from "cheerio";

/**
 * Smart-inject the 37 slot values into an arbitrary page that lacks data-slot
 * attributes.  Elements are matched by semantic position in the DOM — the first
 * <h1> becomes "headline", the first <p> near it becomes "subheadline", etc.
 *
 * Only slots that can be reliably matched are injected; the rest are skipped.
 * The layout, styles, and structure of the page are never touched.
 */
export function smartInject(html, slotValues) {
  const $ = cheerio.load(html);

  // ── helpers ──────────────────────────────────────────────────
  const contentRoot = () => {
    for (const sel of ["main", "[role='main']", "article", "#content", ".content"]) {
      const $el = $(sel);
      if ($el.length) return $el;
    }
    return $("body");
  };

  const $content = contentRoot();

  // Collect section headings (h2/h3 not inside nav/header/footer)
  const $sectionHeadings = $content.find("h2, h3").filter(function () {
    return $(this).closest("nav, header, footer").length === 0;
  });

  // Collect button-like elements in main content (not nav/header/footer)
  const $ctaButtons = $content.find("button, a").filter(function () {
    if ($(this).closest("nav, header, footer").length) return false;
    const t = $(this).text().trim();
    return t.length >= 2 && t.length <= 60;
  });

  // ── helper: safely set text on the first match ──────────────
  function setText(selector, slot) {
    if (!slotValues[slot]) return;
    const $el = typeof selector === "string" ? $(selector).first() : selector;
    if ($el && $el.length) $el.text(slotValues[slot]);
  }

  // ── 1. Hero / headline ──────────────────────────────────────
  const $h1 = $content.find("h1").first();
  if ($h1.length && slotValues["headline"]) $h1.text(slotValues["headline"]);

  // Subheadline: first <p> that's a sibling or within the same parent
  if ($h1.length && slotValues["subheadline"]) {
    const $sub = $h1.nextAll("p").first().length
      ? $h1.nextAll("p").first()
      : $h1.parent().find("p").first();
    if ($sub.length) $sub.text(slotValues["subheadline"]);
  }

  // Eyebrow: short text element right before the h1
  if ($h1.length && slotValues["hero-eyebrow"]) {
    const $prev = $h1.prevAll("p, span, div").filter(function () {
      const t = $(this).text().trim();
      return t.length > 0 && t.length < 80;
    }).first();
    if ($prev.length) $prev.text(slotValues["hero-eyebrow"]);
  }

  // ── 2. CTA buttons ─────────────────────────────────────────
  if ($ctaButtons.length > 0 && slotValues["cta-primary"]) {
    $($ctaButtons[0]).text(slotValues["cta-primary"]);
  }
  if ($ctaButtons.length > 1 && slotValues["cta-secondary"]) {
    $($ctaButtons[1]).text(slotValues["cta-secondary"]);
  }

  // Nav CTA: last link/button in header or nav (typically the CTA)
  if (slotValues["nav-cta"]) {
    const $navLinks = $("header a, nav a").filter(function () {
      const t = $(this).text().trim();
      return t.length >= 2 && t.length <= 40;
    });
    if ($navLinks.length) $($navLinks[$navLinks.length - 1]).text(slotValues["nav-cta"]);
  }

  // ── 3. Stats (look for big numbers near short labels) ──────
  const statSlots = [
    ["social-proof-number", "social-proof-label"],
    ["stat-1-number", "stat-1-label"],
    ["stat-2-number", "stat-2-label"],
    ["stat-3-number", "stat-3-label"],
  ];
  // Find elements that look like stat numbers (short text with digits/symbols)
  const $statCandidates = $content.find("h2, h3, p, span, div").filter(function () {
    if ($(this).closest("nav, header, footer").length) return false;
    const t = $(this).text().trim();
    return t.length >= 1 && t.length <= 15 && /\d/.test(t);
  });
  $statCandidates.each((i, el) => {
    if (i >= statSlots.length) return;
    const [numSlot, labelSlot] = statSlots[i];
    if (slotValues[numSlot]) $(el).text(slotValues[numSlot]);
    if (slotValues[labelSlot]) {
      const $label = $(el).nextAll("p, span").first();
      if ($label.length) $label.text(slotValues[labelSlot]);
    }
  });

  // ── 4. Section headings → benefit/step titles + descriptions ──
  const sectionSlots = [
    ["benefit-1-title", "benefit-1-desc"],
    ["benefit-2-title", "benefit-2-desc"],
    ["benefit-3-title", "benefit-3-desc"],
    ["benefit-4-title", "benefit-4-desc"],
    ["step-1-title", "step-1-desc"],
    ["step-2-title", "step-2-desc"],
    ["step-3-title", "step-3-desc"],
  ];

  $sectionHeadings.each((i, el) => {
    if (i >= sectionSlots.length) return;
    const [titleSlot, descSlot] = sectionSlots[i];
    if (slotValues[titleSlot]) $(el).text(slotValues[titleSlot]);
    if (slotValues[descSlot]) {
      const $desc = $(el).nextAll("p").first();
      if ($desc.length) $desc.text(slotValues[descSlot]);
    }
  });

  // ── 5. Testimonials (look for blockquotes or long-ish quoted text) ──
  const testimonialSlots = [
    ["testimonial-1-quote", "testimonial-1-name", "testimonial-1-role"],
    ["testimonial-2-quote", "testimonial-2-name", "testimonial-2-role"],
    ["testimonial-3-quote", "testimonial-3-name", "testimonial-3-role"],
  ];
  const $quotes = $content.find("blockquote, [class*='testimonial'], [class*='review'], [class*='quote']");
  $quotes.each((i, el) => {
    if (i >= testimonialSlots.length) return;
    const [quoteSlot, nameSlot, roleSlot] = testimonialSlots[i];
    const $block = $(el);
    if (slotValues[quoteSlot]) {
      const $quoteText = $block.find("p, span").first();
      if ($quoteText.length) $quoteText.text(slotValues[quoteSlot]);
      else $block.text(slotValues[quoteSlot]);
    }
    if (slotValues[nameSlot]) {
      const $name = $block.find("cite, strong, b, [class*='name'], [class*='author']").first();
      if ($name.length) $name.text(slotValues[nameSlot]);
    }
    if (slotValues[roleSlot]) {
      const $role = $block.find("small, em, [class*='role'], [class*='title']").first();
      if ($role.length) $role.text(slotValues[roleSlot]);
    }
  });

  // ── 6. FAQ (look for details/summary or repeating heading+paragraph) ──
  const faqSlots = [
    ["faq-1-q", "faq-1-a"],
    ["faq-2-q", "faq-2-a"],
    ["faq-3-q", "faq-3-a"],
    ["faq-4-q", "faq-4-a"],
  ];
  const $details = $content.find("details");
  if ($details.length) {
    $details.each((i, el) => {
      if (i >= faqSlots.length) return;
      const [qSlot, aSlot] = faqSlots[i];
      if (slotValues[qSlot]) $(el).find("summary").first().text(slotValues[qSlot]);
      if (slotValues[aSlot]) $(el).find("p").first().text(slotValues[aSlot]);
    });
  }

  // ── 7. Pricing ──────────────────────────────────────────────
  const $pricingSection = $content.find("[class*='pricing'], [class*='price'], [id*='pricing']").first();
  if ($pricingSection.length) {
    setText($pricingSection.find("h2, h3").first(), "pricing-plan-name");
    const $priceEl = $pricingSection.find("[class*='price'], span, h2, h3").filter(function () {
      return /\$|€|£|₹|\d+/.test($(this).text().trim());
    }).first();
    if ($priceEl.length && slotValues["pricing-price"]) $priceEl.text(slotValues["pricing-price"]);
    setText($pricingSection.find("p").first(), "pricing-desc");
  }

  // ── 8. Final CTA (last prominent section) ───────────────────
  if (slotValues["final-cta-headline"]) {
    const $lastH2 = $sectionHeadings.last();
    if ($lastH2.length) $lastH2.text(slotValues["final-cta-headline"]);
  }
  if (slotValues["final-cta-sub"]) {
    const $lastH2 = $sectionHeadings.last();
    if ($lastH2.length) {
      const $sub = $lastH2.nextAll("p").first();
      if ($sub.length) $sub.text(slotValues["final-cta-sub"]);
    }
  }
  if (slotValues["final-cta-button"] && $ctaButtons.length) {
    $($ctaButtons[$ctaButtons.length - 1]).text(slotValues["final-cta-button"]);
  }

  return $.html();
}
