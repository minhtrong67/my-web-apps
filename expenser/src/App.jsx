import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import SplashScreen from './components/ui/SplashScreen';
import { useSmoothAnchors } from './hooks/useSmoothAnchors';

// Every page is its own chunk, fetched only when visited. The signed-in shell
// (Firestore data layer + app chrome) is one lazy module too, so the login
// screen never downloads the database SDK, charts or export libraries.
const ProtectedShell = lazy(() => import('./routes/ProtectedShell'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TransactionsPage = lazy(() => import('./pages/Transactions'));
const CategoriesPage = lazy(() => import('./pages/Categories'));
const CafeTransactionsPage = lazy(() => import('./pages/CafeTransactions'));
const CafeShopsPage = lazy(() => import('./pages/CafeShops'));
const CafeDrinksPage = lazy(() => import('./pages/CafeDrinks'));
const WalletsPage = lazy(() => import('./pages/Wallets'));
const StatisticsPage = lazy(() => import('./pages/Statistics'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const Landing = lazy(() => import('./pages/Landing'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Notifications are rendered by src/utils/notify.jsx (themed success / error / warning / info cards);
// the Toaster only positions and stacks them.
function ThemedToaster() {
  return <Toaster position="top-center" containerStyle={{ top: 'max(1rem, env(safe-area-inset-top))' }} toastOptions={{ duration: 3000 }} />;
}

// Mounts the global "#section" smooth-scroll handler.
function SmoothAnchors() {
  useSmoothAnchors();
  return null;
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <BrowserRouter>
          <ThemedToaster />
          <SmoothAnchors />
          <Suspense fallback={<SplashScreen />}>
            <Routes>
              {/* Intro page: always reachable (Settings > About links here for signed-in users) */}
              <Route path="/welcome" element={<Landing />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

              <Route
                path="/"
                element={
                  <ProtectedRoute landing={<Landing />}>
                    <ProtectedShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="cafe" element={<CafeTransactionsPage />} />
                <Route path="cafe-shops" element={<CafeShopsPage />} />
                <Route path="cafe-drinks" element={<CafeDrinksPage />} />
                <Route path="wallets" element={<WalletsPage />} />
                <Route path="statistics" element={<StatisticsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                {/* Old routes kept as redirects so bookmarks / PWA shortcuts still work */}
                <Route path="calendar" element={<Navigate to="/transactions" replace />} />
                <Route path="budget" element={<Navigate to="/" replace />} />
                <Route path="recurring" element={<Navigate to="/" replace />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </SettingsProvider>
  );
}
