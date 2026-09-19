export const CATEGORIES = [
  { value: "food", label: "Food & Snacks" },
  { value: "books", label: "Books & Notes" },
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "other", label: "Other" },
];

export function categoryLabel(value) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
