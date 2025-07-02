import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from "react-toastify";

import { MainHeader } from './components/MainHeader';
import Sidebar from './components/MainSidebar';
import ProtectedRoute from './components/ProtectedRoute';

import { AuthProvider } from './contexts/auth-context';
import { FavoritesProvider } from './contexts/favorites-context';
import CraftDetailPage from './pages/craftDetailPage';
import HelpPage from './pages/help';
import HomePage from './pages/home';
import LoginPage from './pages/login';
import SettingsPage from './pages/settings';
import SignupPage from './pages/signup';
import { UploadPage } from './pages/upload';


function App() {
  return (
    <Router>
      <AuthProvider>
        <FavoritesProvider>
          {/* Top Navbar */}
          <MainHeader />
          
          <div className="flex h-[calc(100vh-64px)]">
            {/* Sidebar */}
              <Sidebar />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-4">
              <Routes>
                  <Route path="/" element={<HomePage/>} />
                  <Route path="/explore" element={<h2 className="text-2xl font-bold">Explore Crafts</h2>} />
                  
                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/upload" element={<UploadPage/>} />
                    <Route path="/favorites" element={<h2 className="text-2xl font-bold">My Favorites</h2>} />
                    <Route path="/notifications" element={<h2 className="text-2xl font-bold">Notifications</h2>} />
                    <Route path="/profile" element={<h2 className="text-2xl font-bold">User Profile</h2>} />
                    <Route path="/my-creations" element={<h2 className="text-2xl font-bold">My Creations</h2>} />
                    <Route path="/settings" element={<SettingsPage/>} />
                  </Route>

                  {/* Public Routes */}
                  <Route path="/help" element={<HelpPage/>} />
                  <Route path="/login" element={<LoginPage/>} />
                  <Route path="/signup" element={<SignupPage/>} />
                  <Route path="/cart" element={<h2 className="text-2xl font-bold">Shopping Cart</h2>} />
                  <Route path="/craft/:craftId" element={<CraftDetailPage />} />
                  
                  <Route path="*" element={<h2 className="text-2xl font-bold">404: Page Not Found</h2>} />
                </Routes>
        <ToastContainer />
            </main>
          </div>
        </FavoritesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;