import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/config';
import { ROUTES } from '@/constants';
import { clearCredentials } from '@/store/authSlice';
import authApi from '@/features/auth/api/auth.api';
import { toast } from 'sonner';

/**
 * Dashboard shell with top navigation bar.
 */
const DashboardLayout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      dispatch(clearCredentials());
      toast.success('Logged out successfully');
      navigate(ROUTES.LOGIN, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/30">
              <span className="text-sm font-bold text-primary">A</span>
            </div>
            <span className="font-semibold text-foreground">{APP_NAME}</span>
          </div>

          <nav className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </div>
            <Button
              id="logout-button"
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="ml-4 gap-2 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};

export default DashboardLayout;
