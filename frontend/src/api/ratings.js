import api from "./axios";

export async function getSellerRatings(sellerId) {
  const { data } = await api.get(`/sellers/${sellerId}/ratings/`);
  return data;
}

export async function getMyRating(sellerId) {
  const { data } = await api.get(`/sellers/${sellerId}/ratings/mine/`);
  return data;
}

export async function rateSeller(sellerId, stars, comment) {
  const { data } = await api.put(`/sellers/${sellerId}/ratings/`, { stars, comment });
  return data;
}

export async function deleteMyRating(sellerId) {
  const { data } = await api.delete(`/sellers/${sellerId}/ratings/`);
  return data;
}
