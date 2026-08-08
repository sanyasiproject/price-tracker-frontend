import { useAuth } from "../context/AuthContext";
import { LogOut, TrendingDown, User } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">PriceTracker</span>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm text-gray-700 hidden sm:block">{user.name}</span>
            <button
              onClick={logout}
              className="text-gray-500 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
