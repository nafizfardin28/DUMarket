import api from "./axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
// Uploaded images are served outside the /api prefix, so derive the bare
// origin (http://localhost:8000) to prefix the relative /uploads/... paths
// the backend returns.
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export function imageUrl(path) {
  if (!path) return null;
  return `${API_ORIGIN}${path}`;
}

export async function getListings(params = {}) {
  const { data } = await api.get("/listings/", { params });
  return data;
}

export async function getListing(id) {
  const { data } = await api.get(`/listings/${id}/`);
  return data;
}

export async function getMyListings() {
  const { data } = await api.get("/listings/mine/");
  return data;
}

function toFormData(fields, images) {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, value);
  });
  (images || []).forEach((file) => form.append("images", file));
  return form;
}

export async function createListing(fields, images) {
  const { data } = await api.post("/listings/", toFormData(fields, images), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateListing(id, fields, images) {
  const { data } = await api.patch(`/listings/${id}/`, toFormData(fields, images), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteListing(id) {
  const { data } = await api.delete(`/listings/${id}/`);
  return data;
}
