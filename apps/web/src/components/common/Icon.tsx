import {
  ArrowRight,
  ArrowUpRight,
  Ban,
  BarChart3,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  Clock,
  Copy,
  Download,
  EllipsisVertical,
  ExternalLink,
  Eye,
  Hourglass,
  Infinity as InfinityIcon,
  LayoutDashboard,
  Link as LinkIcon,
  Loader2,
  Lock,
  LogOut,
  type LucideIcon,
  Monitor,
  Moon,
  MousePointerClick,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sun,
  Trash2,
  TriangleAlert,
  X,
  Zap,
} from 'lucide-react';

import type { ExtendedProps } from '@/common/types/global.types';

/** Icon registry — listing each icon explicitly keeps the bundle tree-shakeable. */
const ICONS = {
  ArrowRight,
  ArrowUpRight,
  Ban,
  Calendar,
  Chart: BarChart3,
  Check,
  CheckCircle: CircleCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  Dashboard: LayoutDashboard,
  Download,
  EllipsisVertical,
  ExternalLink,
  Eye,
  Hourglass,
  Infinity: InfinityIcon,
  Link: LinkIcon,
  Loader: Loader2,
  Lock,
  LogOut,
  Monitor,
  Moon,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sun,
  Trash: Trash2,
  TriangleAlert,
  Click: MousePointerClick,
  X,
  Zap,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

interface Props extends ExtendedProps {
  icon: IconName;
}

/**
 * Renders one of the app's registered lucide icons by name.
 **/
export default function Icon({ icon, className }: Props) {
  const Component = ICONS[icon];

  return <Component className={`h-4 w-4 ${className ?? ''}`} aria-hidden />;
}
