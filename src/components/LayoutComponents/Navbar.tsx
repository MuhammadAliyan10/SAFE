"use client";

import { logout } from "@/app/(auth)/actions";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSession } from "@/provider/SessionProvider";
import {
  BookOpen,
  BarChart3,
  NotepadText,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Trophy,
  FileText,
  Users,
  HelpCircle,
  Target,
  Calendar,
  MessageCircle,
  TrendingUp,
  Code,
  Brain,
  Zap,
  Heart,
  Star,
  SettingsIcon,
  TrophyIcon,
  FolderGit2,
  Search,
  Sun,
  Moon,
  Bell,
  Settings,
  UserCircle,
  CreditCard,
  Store,
  Key,
  DollarSign,
  Receipt,
  FileLock,
  Shield,
  Mail,
  Lock,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input"; // Import ShadCN Input for standalone use
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  onMenuToggle: () => void;
  isSidebarExpanded: boolean;
}

const navItems = [
  { name: "Dashboard", icon: BarChart3, section: null, path: "/dashboard" },
  {
    name: "Email Management",
    icon: Mail,
    section: "dropdown",
    children: [
      { name: "Inbox", icon: Mail, path: "/email/inbox" },
      { name: "Automated Orders", icon: FileText, path: "/email/orders" },
      { name: "Threat Detection", icon: Shield, path: "/email/threats" },
      { name: "Auto-Save", icon: FileText, path: "/email/autosave" },
      { name: "Email Settings", icon: SettingsIcon, path: "/email/settings" },
    ],
  },
  {
    name: "Security",
    icon: Shield,
    section: "dropdown",
    children: [
      { name: "2FA Setup", icon: Lock, path: "/security/2fa" },
      { name: "Threat Alerts", icon: Shield, path: "/security/threats" },
      { name: "SDKs & Code", icon: Code, path: "/security/sdks" },
      { name: "Hosting Protection", icon: Store, path: "/security/hosting" },
      { name: "Audit Logs", icon: FileText, path: "/security/audit" },
    ],
  },
  {
    name: "Documents",
    icon: FileLock,
    section: "dropdown",
    children: [
      { name: "Upload Document", icon: FileLock, path: "/documents/upload" },
      { name: "Share Securely", icon: FileText, path: "/documents/share" },
      { name: "Document History", icon: FileText, path: "/documents/history" },
    ],
  },
  {
    name: "Invoicing",
    icon: FileLock,
    section: "dropdown",
    children: [
      { name: "Create Invoice", icon: FileLock, path: "/invoicing/create" },
      { name: "Invoice History", icon: FileText, path: "/invoicing/history" },
      { name: "Payments", icon: CreditCard, path: "/invoicing/payments" },
    ],
  },
  {
    name: "Clients",
    icon: MessageCircle,
    section: "dropdown",
    children: [
      { name: "Manage Clients", icon: MessageCircle, path: "/clients/manage" },
      { name: "Client History", icon: FileText, path: "/clients/history" },
    ],
  },
  {
    name: "Expenses",
    icon: Receipt,
    section: "dropdown",
    children: [
      { name: "Add Expense", icon: Receipt, path: "/expenses/add" },
      { name: "Expense History", icon: FileText, path: "/expenses/history" },
    ],
  },
  {
    name: "Taxes",
    icon: DollarSign,
    section: "dropdown",
    children: [
      { name: "Tax Summary", icon: DollarSign, path: "/taxes/summary" },
      { name: "Export Reports", icon: FileText, path: "/taxes/export" },
    ],
  },
  {
    name: "Integrations",
    icon: Key,
    section: "dropdown",
    children: [
      {
        name: "Payment Methods",
        icon: CreditCard,
        path: "/integrations/payments",
      },
      { name: "Storefronts", icon: Store, path: "/integrations/storefronts" },
    ],
  },
  {
    name: "Subscriptions",
    icon: CreditCard,
    section: null,
    path: "/subscriptions",
  },
  { name: "Calendar", icon: Calendar, section: null, path: "/calendar" },
  { name: "Settings", icon: SettingsIcon, section: null, path: "/settings" },
  { name: "Support", icon: HelpCircle, section: null, path: "/support" },
];

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, isSidebarExpanded }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] =
    useState<boolean>(false);
  const [isCommandOpen, setIsCommandOpen] = useState<boolean>(false);
  const { user } = useSession();
  const { setTheme, theme } = useTheme();
  const router = useRouter();

  // Check for mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest(".profile-menu") &&
        !target.closest(".notification-menu")
      ) {
        setIsProfileMenuOpen(false);
        setIsNotificationMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Command dialog keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    setIsNotificationMenuOpen(false);
  };

  const toggleNotificationMenu = () => {
    setIsNotificationMenuOpen(!isNotificationMenuOpen);
    setIsProfileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logout successful");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error during logout. Please try again.");
    }
  };

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: "New course available",
      message: "React Advanced Patterns is now live",
      time: "2m ago",
      unread: true,
    },
    {
      id: 2,
      title: "Quiz completed",
      message: "You scored 95% on JavaScript Fundamentals",
      time: "1h ago",
      unread: true,
    },
    {
      id: 3,
      title: "Achievement unlocked",
      message: "You've earned the 'Fast Learner' badge",
      time: "3h ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Helper for user initials
  const getInitial = (username?: string) => {
    const safe = username ?? "";
    const initial = safe.slice(0, 1);
    return initial ? initial.toLocaleUpperCase() : "U";
  };

  return (
    <header className="bg-background z-20">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {!isMobile && (
            <div className="relative">
              <Search
                size={16}
                className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              />
              <Input
                placeholder="Type a command or search... (⌘ + J)"
                className="w-[40rem] pl-10 pr-4 py-2 text-sm light:bg-gray-50 bg-secondary border border-border light:border-gray-200 rounded-md focus:outline-none focus:ring-2 light:focus:ring-indigo-500 focus:border-transparent placeholder-gray-500"
                onFocus={() => setIsCommandOpen(true)}
              />
            </div>
          )}
        </div>

        {/* Right Section */}
        <div
          className={`flex items-center gap-3 ${
            isMobile ? "justify-end w-full" : ""
          }`}
        >
          {/* Mobile Search */}
          {isMobile && (
            <button
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center justify-center w-8 h-8 bg-background hover:text-secondary light:text-gray-600 light:hover:text-gray-900 light:hover:bg-gray-100 rounded-md transition-colors"
            >
              <Search size={18} />
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 text-primary hover:bg-secondary light:text-gray-600 light:hover:text-gray-900 light:hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <div className="relative notification-menu">
            <button
              onClick={toggleNotificationMenu}
              className="relative flex items-center justify-center w-8 h-8 text-primary hover:bg-secondary light:text-gray-600 light:hover:text-gray-900 light:hover:bg-gray-100 rounded-md transition-colors"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationMenuOpen && (
              <div
                className="fixed md:absolute right-2 md:right-0 top-16 md:top-10 w-[95vw] max-w-xs md:w-80 bg-card border border-border rounded-lg shadow-lg z-50"
                style={{ maxWidth: isMobile ? "95vw" : "20rem" }}
              >
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-primary light:text-gray-900">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span className="text-xs text-muted-foreground light:text-gray-500">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto bg-card">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-border light:border-gray-100 hover:bg-card/10 light:hover:bg-gray-50 cursor-pointer ${
                        notification.unread ? "bg-card" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-primary light:text-gray-900">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-secondary mt-2">
                            {notification.time}
                          </p>
                        </div>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-indigo-600 rounded-full mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-border">
                  <Link href="/notifications">
                    <button className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                      View all notifications
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <Link href="/settings">
            <button className="flex items-center justify-center w-8 h-8 text-primary hover:bg-secondary light:text-gray-600 light:hover:text-gray-900 light:hover:bg-gray-100 rounded-md transition-colors">
              <Settings size={18} />
            </button>
          </Link>

          {/* Profile Menu (Hidden on Mobile) */}
          {!isMobile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center gap-2 p-1 light:hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
                  aria-label="Profile menu"
                >
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {getInitial(user?.username)}
                    </span>
                  </div>
                  <ChevronDown size={14} className="text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-[40px] h-[40px] p-3 bg-card rounded-full border-border border flex items-center justify-center">
                      <span className="text-primary font-medium">
                        {getInitial(user?.username)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">
                        {user?.username || "Unknown"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {user?.email || "No email"}
                      </p>
                    </div>
                  </div>
                </div>
                <DropdownMenuItem asChild>
                  <Link
                    href="/community/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-primary w-full"
                  >
                    <UserCircle size={16} />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-primary w-full"
                  >
                    <Settings size={16} />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 text-primary w-full"
                >
                  <LogOut size={14} />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Command Dialog */}
      <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {navItems.map((item) => (
            <CommandGroup key={item.name} heading={item.name}>
              {item.section === "dropdown" && item.children ? (
                item.children.map((child) => (
                  <CommandItem
                    key={child.path}
                    onSelect={() => {
                      router.push(child.path);
                      setIsCommandOpen(false);
                    }}
                  >
                    <child.icon />
                    <span>{child.name}</span>
                  </CommandItem>
                ))
              ) : (
                <CommandItem
                  onSelect={() => {
                    router.push(item.path);
                    setIsCommandOpen(false);
                  }}
                >
                  <item.icon />
                  <span>{item.name}</span>
                </CommandItem>
              )}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </header>
  );
};

export default Navbar;
