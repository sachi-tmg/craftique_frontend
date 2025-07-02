import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bell, Heart, Search, ShoppingCart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import logo from '../assets/images/logo.png';
import { useAuth } from '../contexts/auth-context'; // Correctly import useAuth
import { useFavorites } from '../contexts/favorites-context';


export function MainHeader() {
  // -------------------------------------------------------------------------
  // IMPORTANT CHANGE HERE:
  // Destructure userAuth, logout, and setUserAuth from useAuth().
  // Then access isAuthenticated, username, and profilePicture from userAuth.
  const { userAuth, logout, setUserAuth } = useAuth();
  const { isAuthenticated, username, profilePicture, new_notification_available } = userAuth;
  // -------------------------------------------------------------------------

  const { favorites } = useFavorites();
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  const cartCount = 3; // Assuming this is a static placeholder for now or comes from another context

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">

      <Link to="/" className="flex items-center gap-2">
        <img src={logo} alt="Craftique Logo" className="h-12 w-12" />
      </Link>

      {/* Search Bar */}
      <div className="relative mr-auto flex-1 max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search crafts, artists, or categories..."
          className="w-full rounded-full bg-muted pl-8 md:w-[300px] lg:w-[400px]"
          aria-label="Search"
        />
      </div>

      <nav className="flex items-center gap-2">
        {/* Use isAuthenticated from userAuth to check login status */}
        {isAuthenticated ? (
          <>
            <TooltipProvider>
              {/* Favorites Link */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild className={`relative ${isActive('/favorites') ? 'text-red-500' : ''}`}>
                    <Link to="/favorites">
                      <Heart className="h-5 w-5" />
                      {favorites.length > 0 && (
                        <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                          {favorites.length}
                        </Badge>
                      )}
                      <span className="sr-only">Favorites</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Favorites</TooltipContent>
              </Tooltip>

              {/* Notifications Link */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild className={`relative ${isActive('/notifications') ? 'text-red-500' : ''}`}>
                    <Link to="/notifications">
                      <Bell className="h-5 w-5" />
                      {new_notification_available && ( // Show badge if new_notification_available is true
                         <Badge className="absolute -right-1 -top-1 h-3 w-3 rounded-full p-0 flex items-center justify-center bg-red-500 animate-pulse" />
                      )}
                      <span className="sr-only">Notifications</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>

              {/* Shopping Cart Link */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild className={`relative ${isActive('/cart') ? 'text-red-500' : ''}`}>
                    <Link to="/cart">
                      <ShoppingCart className="h-5 w-5" />
                      {cartCount > 0 && (
                        <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                          {cartCount}
                        </Badge>
                      )}
                      <span className="sr-only">Cart</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Cart</TooltipContent>
              </Tooltip>

            </TooltipProvider>

            {/* User Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    {/* Use profilePicture from userAuth for the avatar image */}
                    <AvatarImage src={profilePicture || "/placeholder.svg"} alt={username || "User"} />
                    <AvatarFallback>
                      {/* Use first letter of username or a default icon */}
                      {username ? username.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Display username if available */}
                {username && <DropdownMenuLabel>{username}</DropdownMenuLabel>}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/my-creations">My Creations</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/favorites">Favorites ({favorites.length})</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/help">Help & Support</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* Logout action */}
                <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          // Guest user navigation items (not logged in)
          <>
            {/* Shopping Cart (for guests) */}
            <Button variant="ghost" size="icon" asChild className={`relative mr-4 ${isActive('/cart') ? 'text-red-500' : ''}`}>
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {cartCount}
                  </Badge>
                )}
                <span className="sr-only">Cart</span>
              </Link>
            </Button>
            {/* Login Button */}
            <Button variant="outline" size="default" asChild>
              <Link to="/login">
                Log in
              </Link>
            </Button>
            {/* Sign Up Button */}
            <Button size="default" asChild>
              <Link to="/signup">Sign up</Link>
            </Button>
          </>
        )}
      </nav>
    </header>
  );
}