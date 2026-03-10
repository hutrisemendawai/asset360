import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  Package,
  Tag,
  Building2,
  MapPin,
  ClipboardList,
  ArrowLeftRight,
  Calculator,
  Menu,
  X,
  LogOut,
  UserCircle,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/assets', label: 'Assets', icon: Package },
  { to: '/categories', label: 'Categories', icon: Tag },
  { to: '/departments', label: 'Departments', icon: Building2 },
  { to: '/locations', label: 'Locations', icon: MapPin },
  { to: '/assignments', label: 'Assignments', icon: ClipboardList },
  { to: '/transfers', label: 'Transfers', icon: ArrowLeftRight },
  { to: '/book-value', label: 'Book Value', icon: Calculator },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const topbarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (sidebarRef.current) {
      gsap.fromTo(
        sidebarRef.current,
        { x: -280, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
      );
    }
    if (topbarRef.current) {
      gsap.fromTo(
        topbarRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, delay: 0.2, ease: 'power2.out' },
      );
    }
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-300 lg:relative lg:z-auto',
          collapsed ? 'w-[72px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Logo area */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            A3
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">Asset360</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto hidden lg:flex h-8 w-8"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform',
                collapsed && 'rotate-180',
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden h-8 w-8"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <TooltipProvider delayDuration={0}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const link = (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      collapsed && 'justify-center px-2',
                    )
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.to}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                );
              }
              return link;
            })}
          </TooltipProvider>
        </nav>

        {/* Sidebar footer */}
        {!collapsed && (
          <>
            <Separator />
            <div className="p-3">
              <div className="rounded-lg bg-primary/5 p-3 text-center">
                <p className="text-xs text-muted-foreground">
                  Asset Management System
                </p>
              </div>
            </div>
          </>
        )}
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header
          ref={topbarRef}
          className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-4 lg:px-6"
        >
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden lg:block" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 h-auto py-1.5 px-2"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium leading-none">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {user?.email}
                  </p>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <UserCircle className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
