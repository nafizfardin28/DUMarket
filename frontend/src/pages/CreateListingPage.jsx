import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { createListing } from "../api/listings";
import { CATEGORIES } from "../constants/categories";
import { HALLS } from "../constants/halls";
import { XMarkIcon } from "../components/icons";

const MAX_IMAGES = 4;

const initialForm = {
  title: "",
  description: "",
  price: "",
  category: "",
  hall: "",
};

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Blob URLs for the thumbnail previews — created as files are added, torn
  // down again on removal/unmount so they don't leak memory.
  const [previews, setPreviews] = useState([]);
  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [images]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleImageChange(e) {
    const picked = Array.from(e.target.files || []);
    e.target.value = ""; // let the same file be re-picked later if removed
    setImages((current) => [...current, ...picked].slice(0, MAX_IMAGES));
  }

  function removeImage(index) {
    setImages((current) => current.filter((_, i) => i !== index));
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = ["Title is required."];
    if (!form.description.trim()) errs.description = ["Description is required."];
    if (!form.price || Number(form.price) < 1) errs.price = ["Enter a valid price."];
    if (!form.category) errs.category = ["Please select a category."];
    if (!form.hall) errs.hall = ["Please select a hall."];
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const listing = await createListing(form, images);
      navigate(`/listings/${listing.id}`);
    } catch (err) {
      const data = err.response?.data;
      setErrors(data && typeof data === "object" ? data : { detail: ["Something went wrong. Try again."] });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-xl card p-6 sm:p-8">
        <h1 className="text-xl font-bold text-zinc-900">List something to sell</h1>
        <p className="mt-1 text-sm text-zinc-500">Buyers on your hall (and others) will see this in Browse.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <div>
            <label className="field-label" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Homemade chocolate chip cookies"
              className="field-input"
            />
            {errors.title && <p className="field-error">{errors.title[0]}</p>}
          </div>

          <div>
            <label className="field-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Freshly baked, box of 6..."
              className="field-input"
            />
            {errors.description && <p className="field-error">{errors.description[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="price">
                Price (৳)
              </label>
              <input
                id="price"
                type="number"
                min="1"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="150"
                className="field-input"
              />
              {errors.price && <p className="field-error">{errors.price[0]}</p>}
            </div>

            <div>
              <label className="field-label" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="field-input"
              >
                <option value="">Select…</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {errors.category && <p className="field-error">{errors.category[0]}</p>}
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="hall">
              Pickup hall
            </label>
            <select
              id="hall"
              value={form.hall}
              onChange={(e) => update("hall", e.target.value)}
              className="field-input"
            >
              <option value="">Select your hall…</option>
              {HALLS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            {errors.hall && <p className="field-error">{errors.hall[0]}</p>}
          </div>

          <div>
            <label className="field-label" htmlFor="images">
              Photos <span className="font-normal text-zinc-400">(up to {MAX_IMAGES}, optional)</span>
            </label>

            {previews.length > 0 && (
              <div className="mb-3 grid grid-cols-4 gap-2">
                {previews.map((src, index) => (
                  <div key={src} className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200/70">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      aria-label="Remove photo"
                      className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-950/60
                        text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length < MAX_IMAGES && (
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="field-input file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-brand-600"
              />
            )}
            <p className="mt-1 text-xs text-zinc-500">
              {images.length}/{MAX_IMAGES} photo{images.length === 1 ? "" : "s"} selected. You can add more than
              one at a time, or pick them one by one.
            </p>
            {errors.images && <p className="field-error">{errors.images[0]}</p>}
          </div>

          {errors.detail && <p className="field-error">{errors.detail[0] || errors.detail}</p>}

          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Publishing…" : "Publish listing"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
