export const pricingCatalog = [
  {
    category: "Pavers and patios",
    examples: ["travertine patio", "concrete pavers", "demo and base prep", "edge restraint"]
  },
  {
    category: "Pergolas and shade structures",
    examples: ["aluminum pergola", "wood pergola", "footings", "electrical coordination"]
  },
  {
    category: "Fire features",
    examples: ["gas fire pit", "fire bowls", "gas line coordination", "ignition package"]
  },
  {
    category: "Outdoor kitchens",
    examples: ["grill island", "countertop", "appliance cutouts", "utility coordination"]
  },
  {
    category: "Water features",
    examples: ["fountain", "pondless waterfall", "pump access", "auto-fill coordination"]
  },
  {
    category: "Artificial turf",
    examples: ["pet turf", "putting green", "base prep", "infill"]
  },
  {
    category: "Irrigation and drainage",
    examples: ["drip conversion", "controller", "valves", "surface drainage"]
  },
  {
    category: "Landscape planting and lighting",
    examples: ["plant package", "boulders", "low-voltage lights", "gravel refresh"]
  },
  {
    category: "Retaining and masonry",
    examples: ["seat wall", "retaining wall", "CMU", "stucco", "capstone"]
  },
  {
    category: "Permits, HOA, and design",
    examples: ["HOA packet", "permit revision", "CompanyCam measurement review", "final design signoff"]
  }
];

export function formatPricingCatalogForPrompt() {
  return pricingCatalog
    .map((item) => `- ${item.category}: ${item.examples.join(", ")}`)
    .join("\n");
}
