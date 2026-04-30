import { Link, useLocation } from 'react-router-dom';

const HomeIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const HistoryIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-100 dark:border-[#1e1e1e] md:hidden z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center gap-1 flex-1 py-2 transition-colors ${
            pathname === '/dashboard' ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <HomeIcon filled={pathname === '/dashboard'} />
          <span className="text-xs font-medium">Dashboard</span>
        </Link>

        <Link to="/add-meal" className="flex flex-col items-center gap-1 flex-1 py-2 -mt-5">
          <div className="w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-xs font-medium text-primary-500">Log Meal</span>
        </Link>

        <Link
          to="/history"
          className={`flex flex-col items-center gap-1 flex-1 py-2 transition-colors ${
            pathname === '/history' ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <HistoryIcon filled={pathname === '/history'} />
          <span className="text-xs font-medium">History</span>
        </Link>
      </div>
    </nav>
  );
}
