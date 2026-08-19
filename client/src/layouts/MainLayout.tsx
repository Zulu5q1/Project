import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) =>
    location.pathname === path ? "text-primary-600 font-semibold" : "text-gray-700";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-primary-600">
              UniXchange
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link to="/" className={`hover:text-primary-600 transition-colors ${isActive("/")}`}>
                Home
              </Link>
              <Link
                to="/marketplace"
                className={`hover:text-primary-600 transition-colors ${isActive("/marketplace")}`}
              >
                Marketplace
              </Link>
              {user && (
                <>
                  <Link
                    to="/listings/new"
                    className={`hover:text-primary-600 transition-colors ${isActive("/listings/new")}`}
                  >
                    Sell
                  </Link>
                  <Link
                    to="/profile"
                    className={`hover:text-primary-600 transition-colors ${isActive("/profile")}`}
                  >
                    Profile
                  </Link>
                </>
              )}
              {user?.role === "ADMIN" && (
                <Link
                  to="/admin"
                  className={`hover:text-primary-600 transition-colors ${isActive("/admin")}`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-500 hidden sm:inline">
                  {user.firstName}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`hover:text-primary-600 transition-colors ${isActive("/login")}`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} UniXchange. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-gray-500">
            <span>About</span>
            <span>Terms</span>
            <span>Privacy</span>
            <span>Contact</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
