import {
  Accessibility, Activity, AlertCircle, AlertTriangle, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight,
  Award, Baby, BadgeCheck, BadgePercent, Ban, Banknote, BarChart, BarChart2, Bell, BellRing,
  Bluetooth, Bookmark, BookOpen, Box, Boxes, CalendarCheck, CalendarClock, Camera,
  Check, CheckCircle, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  CircleCheck, CircleSlash, Clipboard, ClipboardCheck, Clock, Clock2, Cloud, CloudDownload,
  CloudSun, CloudUpload, Cog, Copy, Cpu, CreditCard, Crown, Diamond, DollarSign, Download,
  Droplets, Euro, ExternalLink, Eye, EyeOff, File, FileCheck, FileText, Filter, Fingerprint,
  Flag, Flame, Flower2, FolderCheck, Gauge, Gem, Gift, Globe, Globe2, GraduationCap, Grid,
  Hammer, Handshake, Headphones, Heart, HeartHandshake, HelpCircle, Home, Hourglass,
  Image, Images, Info, KeyRound, Languages, Laptop, Layers, Leaf, Lightbulb, LineChart, Link,
  List, Lock, LockKeyhole, Mail, MapPin, Medal, Megaphone, Menu, MessageCircle, MessageSquare,
  Mic, Minus, Monitor, Moon, MoreHorizontal, MoreVertical, Music, Navigation, Package,
  PackageCheck, PackageOpen, PartyPopper, Percent, Phone, PhoneCall, PieChart, PiggyBank, Pin,
  Plane, Play, PlayCircle, Plus, Printer, Puzzle, QrCode, Receipt, Recycle, RefreshCw, Rocket,
  RotateCcw, Scan, Search, Send, Server, Settings, Share, Share2, Shield, ShieldAlert, ShieldCheck,
  Ship, ShoppingBag, ShoppingCart, SlidersHorizontal, Smartphone, Sparkles, Sprout, Star, Stars,
  Store, Sun, Tag, Tags, Target, ThumbsUp, Timer, TimerOff, TreeDeciduous, TrendingDown,
  TrendingUp, Trophy, Truck, Upload, User, UserCheck, UserPlus, Users, UsersRound, Video,
  Wallet, Wifi, WifiOff, Wrench, X, Zap, ZapOff,
  type LucideProps, type LucideIcon,
} from 'lucide-react';
import { memo } from 'react';

/**
 * Curated icon map matching the CRM config editor's IconSelector.
 * Only these ~197 icons are available to merchants, so we don't need
 * the full lucide bundle or dynamic imports.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  Accessibility, Activity, AlertCircle, AlertTriangle, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight,
  Award, Baby, BadgeCheck, BadgePercent, Ban, Banknote, BarChart, BarChart2, Bell, BellRing,
  Bluetooth, Bookmark, BookOpen, Box, Boxes, CalendarCheck, CalendarClock, Camera,
  Check, CheckCircle, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  CircleCheck, CircleSlash, Clipboard, ClipboardCheck, Clock, Clock2, Cloud, CloudDownload,
  CloudSun, CloudUpload, Cog, Copy, Cpu, CreditCard, Crown, Diamond, DollarSign, Download,
  Droplets, Euro, ExternalLink, Eye, EyeOff, File, FileCheck, FileText, Filter, Fingerprint,
  Flag, Flame, Flower2, FolderCheck, Gauge, Gem, Gift, Globe, Globe2, GraduationCap, Grid,
  Hammer, Handshake, Headphones, Heart, HeartHandshake, HelpCircle, Home, Hourglass,
  Image, Images, Info, KeyRound, Languages, Laptop, Layers, Leaf, Lightbulb, LineChart, Link,
  List, Lock, LockKeyhole, Mail, MapPin, Medal, Megaphone, Menu, MessageCircle, MessageSquare,
  Mic, Minus, Monitor, Moon, MoreHorizontal, MoreVertical, Music, Navigation, Package,
  PackageCheck, PackageOpen, PartyPopper, Percent, Phone, PhoneCall, PieChart, PiggyBank, Pin,
  Plane, Play, PlayCircle, Plus, Printer, Puzzle, QrCode, Receipt, Recycle, RefreshCw, Rocket,
  RotateCcw, Scan, Search, Send, Server, Settings, Share, Share2, Shield, ShieldAlert, ShieldCheck,
  Ship, ShoppingBag, ShoppingCart, SlidersHorizontal, Smartphone, Sparkles, Sprout, Star, Stars,
  Store, Sun, Tag, Tags, Target, ThumbsUp, Timer, TimerOff, TreeDeciduous, TrendingDown,
  TrendingUp, Trophy, Truck, Upload, User, UserCheck, UserPlus, Users, UsersRound, Video,
  Wallet, Wifi, WifiOff, Wrench, X, Zap, ZapOff,
};

interface DynamicIconProps extends LucideProps {
  name: string;
}

export const DynamicIcon = memo(function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const Icon = ICON_MAP[name] || Check;
  return <Icon {...props} />;
});
