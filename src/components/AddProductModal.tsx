import { useState } from "react";
import { X } from "lucide-react";
import { addProduct } from "../services/api";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export default function AddProductModal({ open, onClose, onAdded }: Props) {
  const [url, setUrl] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [interval, setInterval] = useState("12h");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !targetPrice.trim()) return;

    setLoading(true);
    try {
      await addProduct(url.trim(), Number(targetPrice), interval);
      toast.success("Product added!");
      setUrl("");
      setTargetPrice("");
      setInterval("12h");
      onAdded();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const detectPlatform = (u: string) => {
    const lower = u.toLowerCase();
    if (lower.includes("amazon")) return "Amazon";
    if (lower.includes("flipkart") || lower.includes("fkrt.it")) return "Flipkart";
    return null;
  };

  const platform = detectPlatform(url);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Track a Product</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste Amazon or Flipkart product link"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            />
            {platform && (
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                platform === "Amazon" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
              }`}>
                {platform}
              </span>
            )}
            {url && !platform && (
              <span className="inline-block mt-1 text-xs text-red-500">
                Only Amazon and Flipkart URLs are supported
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Price (INR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">&#8377;</span>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="20000"
                min="1"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check Every
            </label>
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="6h">6 Hours</option>
              <option value="12h">12 Hours</option>
              <option value="24h">24 Hours</option>
              <option value="2d">2 Days</option>
              <option value="5d">5 Days</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !platform}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {loading ? "Adding..." : "Start Tracking"}
          </button>
        </form>
      </div>
    </div>
  );
}
