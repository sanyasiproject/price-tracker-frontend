import { useState } from "react";
import { Trash2, RefreshCw, ExternalLink, Bell, BellOff, ChevronDown, ChevronUp, Pause, Play } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { Product } from "../services/api";
import { deleteProduct, refreshProduct, updateProduct } from "../services/api";
import toast from "react-hot-toast";

interface Props {
  product: Product;
  onUpdate: () => void;
}

export default function ProductCard({ product, onUpdate }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [editing, setEditing] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [newTarget, setNewTarget] = useState(String(product.targetPrice));
  const [newInterval, setNewInterval] = useState(product.checkInterval);

  const priceDiff = product.currentPrice - product.targetPrice;
  const isBelow = product.currentPrice > 0 && product.currentPrice <= product.targetPrice;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshProduct(product._id);
      toast.success("Price updated!");
      onUpdate();
    } catch {
      toast.error("Failed to refresh price");
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Stop tracking this product?")) return;
    try {
      await deleteProduct(product._id);
      toast.success("Product removed");
      onUpdate();
    } catch {
      toast.error("Failed to remove");
    }
  };

  const handleTogglePause = async () => {
    setToggling(true);
    try {
      await updateProduct(product._id, { paused: !product.paused });
      toast.success(product.paused ? "Tracking resumed" : "Tracking paused");
      onUpdate();
    } catch {
      toast.error("Failed to update");
    } finally {
      setToggling(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updateProduct(product._id, {
        targetPrice: Number(newTarget),
        checkInterval: newInterval,
      });
      toast.success("Updated!");
      setEditing(false);
      onUpdate();
    } catch {
      toast.error("Failed to update");
    }
  };

  const chartData = product.priceHistory.map((p) => ({
    date: new Date(p.checkedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    time: new Date(p.checkedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    price: p.price,
  }));

  const formatPrice = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const nextCheckIn = () => {
    if (!product.lastChecked || product.paused) return null;
    const intervalMs: Record<string, number> = { "6h": 6*3600000, "12h": 12*3600000, "24h": 24*3600000, "2d": 2*86400000, "5d": 5*86400000 };
    const nextTime = new Date(product.lastChecked).getTime() + (intervalMs[product.checkInterval] || 12*3600000);
    const diff = nextTime - Date.now();
    if (diff <= 0) return "Due now";
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `Next check in ${hours}h ${mins}m`;
    return `Next check in ${mins}m`;
  };

  return (
    <div className={`bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow ${product.paused ? "border-gray-300 opacity-75" : "border-gray-200"}`}>
      <div className="p-4">
        <div className="flex gap-3">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-20 h-20 object-contain rounded-lg bg-gray-50 shrink-0"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs shrink-0">
              No image
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{product.title}</h3>
              <div className="flex items-center gap-1.5 shrink-0">
                {product.paused && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">Paused</span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  product.platform === "amazon" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {product.platform === "amazon" ? "Amazon" : "Flipkart"}
                </span>
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              {product.currentPrice > 0 ? (
                <>
                  <span className="text-lg font-bold text-gray-900">{formatPrice(product.currentPrice)}</span>
                  <span className={`text-xs font-medium ${isBelow ? "text-green-600" : "text-gray-500"}`}>
                    {isBelow ? (
                      <span className="flex items-center gap-0.5">
                        <Bell className="w-3 h-3" /> Below target!
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5">
                        <BellOff className="w-3 h-3" /> {formatPrice(priceDiff)} above target
                      </span>
                    )}
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-400">Price not yet fetched</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span>Target: <strong className="text-gray-700">{formatPrice(product.targetPrice)}</strong></span>
            <span>Every {{ "6h": "6 hrs", "12h": "12 hrs", "24h": "24 hrs", "2d": "2 days", "5d": "5 days" }[product.checkInterval]}</span>
          </div>
          <div className="text-right">
            {product.lastChecked && (
              <div>
                Checked {new Date(product.lastChecked).toLocaleString("en-IN", {
                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                })}
              </div>
            )}
            {nextCheckIn() && (
              <div className={product.paused ? "text-gray-400" : "text-blue-500"}>
                {product.paused ? "Paused" : nextCheckIn()}
              </div>
            )}
          </div>
        </div>

        {editing && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500">Target Price</label>
                <input
                  type="number"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full px-2 py-1.5 border rounded text-sm mt-0.5"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500">Check Every</label>
                <select
                  value={newInterval}
                  onChange={(e) => setNewInterval(e.target.value as any)}
                  className="w-full px-2 py-1.5 border rounded text-sm mt-0.5"
                >
                  <option value="6h">6 Hours</option>
                  <option value="12h">12 Hours</option>
                  <option value="24h">24 Hours</option>
                  <option value="2d">2 Days</option>
                  <option value="5d">5 Days</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveEdit} className="px-3 py-1 bg-blue-600 text-white rounded text-xs">Save</button>
              <button onClick={() => setEditing(false)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs">Cancel</button>
            </div>
          </div>
        )}

        {showChart && chartData.length > 1 && (
          <div className="mt-3 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(val) => [formatPrice(Number(val)), "Price"]}
                  labelFormatter={(_label, payload) => {
                    if (payload?.[0]?.payload) return `${payload[0].payload.date} ${payload[0].payload.time}`;
                    return String(_label);
                  }}
                />
                <ReferenceLine y={product.targetPrice} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Target", fontSize: 10, fill: "#ef4444" }} />
                <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} dot={chartData.length < 20} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {showChart && chartData.length <= 1 && (
          <div className="mt-3 text-center text-xs text-gray-400 py-4">
            Not enough data yet. Chart will appear after 2+ price checks.
          </div>
        )}

        <div className="mt-3 flex items-center gap-1 border-t border-gray-100 pt-3">
          <button
            onClick={handleTogglePause}
            disabled={toggling}
            className={`p-1.5 rounded transition-colors ${
              product.paused
                ? "text-green-500 hover:bg-green-50"
                : "text-yellow-500 hover:bg-yellow-50"
            }`}
            title={product.paused ? "Resume tracking" : "Pause tracking"}
          >
            {product.paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing || product.paused}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-40"
            title="Refresh price now"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowChart(!showChart)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Price history"
          >
            {showChart ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setEditing(!editing)}
            className="px-2 py-1 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            Edit
          </button>
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors ml-auto"
            title="Open product page"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Stop tracking"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
