import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { assetsApi, categoriesApi, departmentsApi, locationsApi } from '@/lib/api';
import { useGsapFadeIn, useGsapStagger, animateHoverScale, animateHoverReset } from '@/hooks/use-gsap';
import { Card, CardContent } from '@/components/ui/card';
import {
  Package,
  Tag,
  Building2,
  MapPin,
  ClipboardList,
  ArrowLeftRight,
  Calculator,
  UserCircle,
  TrendingUp,
  Boxes,
  LayoutGrid,
  Globe,
} from 'lucide-react';

interface StatItem {
  label: string;
  value: number | string;
  icon: typeof Package;
  color: string;
}

const navCards = [
  {
    to: '/assets',
    label: 'Assets',
    description: 'Manage all fixed assets, add new entries, and track details',
    icon: Package,
    color: 'from-violet-500 to-purple-600',
  },
  {
    to: '/categories',
    label: 'Categories',
    description: 'Organize assets into categories for easier management',
    icon: Tag,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    to: '/departments',
    label: 'Departments',
    description: 'View and manage company departments',
    icon: Building2,
    color: 'from-emerald-500 to-green-600',
  },
  {
    to: '/locations',
    label: 'Locations',
    description: 'Track asset locations and office branches',
    icon: MapPin,
    color: 'from-orange-500 to-amber-500',
  },
  {
    to: '/assignments',
    label: 'Assignments',
    description: 'Assign assets to departments and track usage',
    icon: ClipboardList,
    color: 'from-pink-500 to-rose-500',
  },
  {
    to: '/transfers',
    label: 'Transfers',
    description: 'Request and manage asset transfers between locations',
    icon: ArrowLeftRight,
    color: 'from-indigo-500 to-blue-600',
  },
  {
    to: '/book-value',
    label: 'Book Value',
    description: 'Calculate depreciation and current book values',
    icon: Calculator,
    color: 'from-teal-500 to-cyan-600',
  },
  {
    to: '/profile',
    label: 'Profile',
    description: 'View and update your personal information',
    icon: UserCircle,
    color: 'from-fuchsia-500 to-purple-600',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const headerRef = useGsapFadeIn(0);
  const statsContainerRef = useGsapStagger('[data-stat]', 0.2);
  const cardsContainerRef = useGsapStagger('[data-card]', 0.35);

  const [stats, setStats] = useState<StatItem[]>([
    { label: 'Total Assets', value: '—', icon: Boxes, color: 'text-violet-500' },
    { label: 'Categories', value: '—', icon: LayoutGrid, color: 'text-blue-500' },
    { label: 'Departments', value: '—', icon: Building2, color: 'text-emerald-500' },
    { label: 'Locations', value: '—', icon: Globe, color: 'text-orange-500' },
  ]);

  useEffect(() => {
    Promise.allSettled([
      assetsApi.list(),
      categoriesApi.list(),
      departmentsApi.list(),
      locationsApi.list(),
    ]).then(([a, c, d, l]) => {
      setStats([
        {
          label: 'Total Assets',
          value: a.status === 'fulfilled' ? a.value.length : '—',
          icon: Boxes,
          color: 'text-violet-500',
        },
        {
          label: 'Categories',
          value: c.status === 'fulfilled' ? c.value.length : '—',
          icon: LayoutGrid,
          color: 'text-blue-500',
        },
        {
          label: 'Departments',
          value: d.status === 'fulfilled' ? d.value.length : '—',
          icon: Building2,
          color: 'text-emerald-500',
        },
        {
          label: 'Locations',
          value: l.status === 'fulfilled' ? l.value.length : '—',
          icon: Globe,
          color: 'text-orange-500',
        },
      ]);
    });
  }, []);

  const handleHover = useCallback((e: React.MouseEvent, enter: boolean) => {
    const el = e.currentTarget as HTMLElement;
    if (enter) animateHoverScale(el);
    else animateHoverReset(el);
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div ref={headerRef}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {user?.fullName?.split(' ')[0] ?? 'User'}
            </h1>
            <p className="text-muted-foreground text-sm">
              Here&apos;s an overview of your asset management system
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div
        ref={statsContainerRef}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              data-stat
              className="border-border/50 shadow-sm"
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Navigation cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
        <div
          ref={cardsContainerRef}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.to}
                data-card
                className="group cursor-pointer border-border/50 shadow-sm hover:shadow-md transition-shadow"
                onClick={() => navigate(card.to)}
                onMouseEnter={(e) => handleHover(e, true)}
                onMouseLeave={(e) => handleHover(e, false)}
              >
                <CardContent className="p-5 space-y-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${card.color} text-white shadow-sm`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {card.label}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      {card.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
