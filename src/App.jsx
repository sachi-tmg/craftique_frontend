import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from "react-toastify";

import { MainHeader } from './components/MainHeader';
import Sidebar from './components/MainSidebar';
import ProtectedRoute from './components/ProtectedRoute';

import { AuthProvider } from './contexts/auth-context';
import { CartProvider } from './contexts/cart-context';
import { FavoritesProvider } from './contexts/favorites-context';
import CartPage from './pages/cartPage';
import CheckoutPage from './pages/checkout';
import CraftDetailPage from './pages/craftDetailPage';
import EditCreationPage from './pages/editCreationPage';
import ExplorePage from './pages/explore';
import FavoritesPage from './pages/favorites';
import ForgotPasswordPage from './pages/forgotPassword';
import HelpPage from './pages/help';
import HomePage from './pages/home';
import LoginPage from './pages/login';
import NotificationsPage from './pages/notification';
import OrderDetailsPage from './pages/orderDetailPage';
import OrdersPage from './pages/orderPage';
import ProfilePage from './pages/profile';
import SearchPage from './pages/search';
import SettingsPage from './pages/settings';
import SignupPage from './pages/signup';
import { UploadPage } from './pages/upload';
import VerifyEsewaPage from './pages/verify-esewa';

function App() {
  return (
    <Router>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
          {/* Top Navbar */}
          <MainHeader />

          <div className="flex h-[calc(100vh-64px)]">
            {/* Sidebar */}
              <Sidebar />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-4">
              <Routes>
                  <Route path="/" element={<HomePage/>} />
                  <Route path="/explore" element={<ExplorePage/>} />
                  <Route path="/search" element={<SearchPage/>} />

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/upload" element={<UploadPage/>} />
                    <Route path="/favorites" element={<FavoritesPage/>} />
                    <Route path="/notifications" element={<NotificationsPage/>} />
                    <Route path="/profile/:username" element={<ProfilePage/>} />
                    <Route path="/my-creations" element={<h2 className="text-2xl font-bold">My Creations</h2>} />
                    <Route path="/settings" element={<SettingsPage/>} />
                    {/* Add this new route for editing creations */}
                    <Route path="/edit-creation/:creation_id" element={<EditCreationPage/>} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
                    <Route path="/verify-esewa" element={<VerifyEsewaPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                  </Route>

                  {/* Public Routes */}
                  <Route path="/help" element={<HelpPage/>} />
                  <Route path="/login" element={<LoginPage/>} />
                  <Route path="/signup" element={<SignupPage/>} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} /> 
                  <Route path="/cart" element={<CartPage/>} />
                  <Route path="/craft/:craftId" element={<CraftDetailPage />} />

                  <Route path="*" element={<h2 className="text-2xl font-bold">404: Page Not Found</h2>} />
                </Routes>
                <ToastContainer />
            </main>
          </div>
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;