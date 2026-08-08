import { useEffect, useState } from "react";
import { Plus, Package } from "lucide-react";
import type { Product } from "../services/api";
import { getProducts } from "../services/api";
import ProductCard from "../components/ProductCard";
import AddProductModal from "../components/AddProductModal";

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch {
      // handle error silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Tracking {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No products tracked yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Add an Amazon or Flipkart product URL to start tracking its price.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Track Your First Product
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} onUpdate={loadProducts} />
          ))}
        </div>
      )}

      <AddProductModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAdded={loadProducts}
      />
    </div>
  );
}
