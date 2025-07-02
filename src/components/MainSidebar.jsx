import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Compass,
  HelpCircle,
  Home,
  PlusSquare,
  Settings,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context'; // Correctly import useAuth

export default function Sidebar() {
  // -------------------------------------------------------------------------
  // IMPORTANT CHANGE HERE:
  // Destructure userAuth from useAuth(), then access isAuthenticated from userAuth.
  const { userAuth } = useAuth();
  const { isAuthenticated } = userAuth;
  // -------------------------------------------------------------------------

  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <TooltipProvider>
      <aside className="h-full w-16 bg-background border-r flex flex-col items-center gap-4 py-4 z-20">

        {/* Home */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className={isActive('/') ? 'bg-red-100 text-red-500' : ''}
            >
              <Link to="/">
                <Home className="h-5 w-5" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Home</TooltipContent>
        </Tooltip>

        {/* Explore */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className={isActive('/explore') ? 'bg-red-100 text-red-500' : ''}
            >
              <Link to="/explore">
                <Compass className="h-5 w-5" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Explore</TooltipContent>
        </Tooltip>

        {/* Upload (conditionally rendered for logged-in users) */}
        {isAuthenticated && ( // Use isAuthenticated from userAuth
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                asChild
                className={isActive('/upload') ? 'bg-red-100 text-red-500' : ''}
              >
                <Link to="/upload">
                  <PlusSquare className="h-5 w-5" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Upload</TooltipContent>
          </Tooltip>
        )}

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Settings (conditionally rendered for logged-in users) */}
        {isAuthenticated && ( // Use isAuthenticated from userAuth
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                asChild
                className={isActive('/settings') ? 'bg-red-100 text-red-500' : ''}
              >
                <Link to="/settings">
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        )}

        {/* Help */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className={isActive('/help') ? 'bg-red-100 text-red-500' : ''}
            >
              <Link to="/help">
                <HelpCircle className="h-5 w-5" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Help</TooltipContent>
        </Tooltip>
      </aside>
    </TooltipProvider>
  );
}