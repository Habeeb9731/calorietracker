import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavLink = ({ to, children }) => {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
        active
          ? 'bg-primary-500 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  );
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🥗</span>
          <span className="font-bold text-gray-900 text-lg">CalorieTracker</span>
        </Link>

        <div className="flex items-center gap-1">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/add-meal">Log Meal</NavLink>
          <NavLink to="/history">History</NavLink>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:block">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-500 font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
