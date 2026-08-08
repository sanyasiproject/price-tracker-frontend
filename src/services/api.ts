import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface PriceRecord {
  price: number;
  checkedAt: string;
}

export interface Product {
  _id: string;
  url: string;
  platform: "amazon" | "flipkart";
  title: string;
  imageUrl: string;
  currentPrice: number;
  targetPrice: number;
  checkInterval: "6h" | "12h" | "24h" | "2d" | "5d";
  priceHistory: PriceRecord[];
  paused: boolean;
  notified: boolean;
  lastChecked: string | null;
  createdAt: string;
}

export async function signup(email: string, password: string, name: string): Promise<{ token: string; user: User }> {
  const { data } = await api.post("/auth/signup", { email, password, name });
  return data;
}

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function getProducts(): Promise<Product[]> {
  const { data } = await api.get("/products");
  return data;
}

export async function addProduct(url: string, targetPrice: number, checkInterval: string): Promise<Product> {
  const { data } = await api.post("/products", { url, targetPrice, checkInterval });
  return data;
}

export async function updateProduct(id: string, updates: { targetPrice?: number; checkInterval?: string; paused?: boolean }): Promise<Product> {
  const { data } = await api.patch(`/products/${id}`, updates);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function refreshProduct(id: string): Promise<Product> {
  const { data } = await api.post(`/products/${id}/refresh`);
  return data;
}
