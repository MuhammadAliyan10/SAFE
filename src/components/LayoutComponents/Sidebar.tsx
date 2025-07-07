"use client";
import { logout } from "@/app/(auth)/actions";
import { fetchProjectInformation } from "@/app/actions/main";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  FileText,
  Code,
  Users,
  Heart,
  Trophy,
  TrendingUp,
  Brain,
  Target,
  NotepadText,
  Star,
  Zap,
  FolderGit2,
  User,
  MessageCircle,
  TrophyIcon,
  Calendar,
  SettingsIcon,
  HelpCircle,
  CreditCard,
  Receipt,
  FileText as FileTextIcon,
  Shield,
  Key,
  Store,
  Lock,
  DollarSign,
  File,
  ChevronUp,
  ChevronDown,
  GraduationCap,
  LogOut,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
  FileLock,
  Mail,
  ShieldCheck,
  GitBranch,
  Server,
} from "lucide-react";
import { useRouter, usePathname, useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string;
  service: string;
  createdAt: string;
  lastModified: string;
}

interface NavItem {
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  section: string | null;
  children?: {
    name: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    path?: string;
  }[];
  path?: string;
}

interface SidebarProps {
  isExpanded: boolean;
  toggleSidebar: () => void;
}

enum ProjectType {
  BUSINESS_SECURITY = "BUSINESS_SECURITY",
  INVOICING = "INVOICING",
  DOCUMENT_SECURITY = "DOCUMENT_SECURITY",
  ALL_SERVICES = "ALL_SERVICES",
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, toggleSidebar }) => {
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sidebar_expanded_sections");
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  });
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const projectId = params.id as string;
  const [projectDetails, setProjectDetails] = useState<Project>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navItemsByService: { [key in ProjectType]: NavItem[] } = {
    [ProjectType.BUSINESS_SECURITY]: [
      {
        name: "Dashboard",
        icon: BarChart3,
        section: null,
        path: `/apps/${projectId}/dashboard`,
      },
      {
        name: "Email Management",
        icon: Mail,
        section: "dropdown",
        children: [
          { name: "Inbox", icon: Mail, path: `/apps/${projectId}/email/inbox` },
          // { name: "Automated Orders", icon: FileText, path: `/apps/${projectId}/email/orders` }, // Not MVP
          // { name: "Threat Detection", icon: Shield, path: `/apps/${projectId}/email/threats` }, // Not MVP
          // { name: "Auto-Save", icon: FileText, path: `/apps/${projectId}/email/autosave` }, // Not MVP
          // { name: "Settings", icon: SettingsIcon, path: `/apps/${projectId}/email/settings` }, // Not MVP
        ],
      },
      // {
      //   name: "Security",
      //   icon: Shield,
      //   section: "dropdown",
      //   children: [ ... ] // Not MVP
      // },
      // Documents section only if you have implemented upload/history
      // {
      //   name: "Documents",
      //   icon: FileLock,
      //   section: "dropdown",
      //   children: [ ... ]
      // },
      // Invoicing section only if you have implemented it
      // {
      //   name: "Invoicing",
      //   icon: FileLock,
      //   section: "dropdown",
      //   children: [ ... ]
      // },
      // Expenses section only if you have implemented it
      // {
      //   name: "Expenses",
      //   icon: Receipt,
      //   section: "dropdown",
      //   children: [ ... ]
      // },
      {
        name: "Settings",
        icon: SettingsIcon,
        section: null,
        path: `/apps/${projectId}/settings`,
      },
      {
        name: "Support",
        icon: HelpCircle,
        section: null,
        path: `/apps/${projectId}/support`,
      },
    ],
    [ProjectType.INVOICING]: [
      {
        name: "Dashboard",
        icon: BarChart3,
        section: null,
        path: `/apps/${projectId}/dashboard`,
      },
      {
        name: "Invoicing",
        icon: FileLock,
        section: "dropdown",
        children: [
          {
            name: "Create Invoice",
            icon: FileLock,
            path: `/apps/${projectId}/invoicing/create`,
          },
          {
            name: "Invoice History",
            icon: FileText,
            path: `/apps/${projectId}/invoicing/history`,
          },
          // { name: "Payments", icon: CreditCard, path: `/apps/${projectId}/invoicing/payments` }, // Not MVP
        ],
      },
      // {
      //   name: "Clients",
      //   icon: MessageCircle,
      //   section: "dropdown",
      //   children: [ ... ] // Not MVP
      // },
      // {
      //   name: "Expenses",
      //   icon: Receipt,
      //   section: "dropdown",
      //   children: [ ... ] // Not MVP
      // },
      // {
      //   name: "Taxes",
      //   icon: DollarSign,
      //   section: "dropdown",
      //   children: [ ... ] // Not MVP
      // },
      {
        name: "Settings",
        icon: SettingsIcon,
        section: null,
        path: `/apps/${projectId}/settings`,
      },
      {
        name: "Support",
        icon: HelpCircle,
        section: null,
        path: `/apps/${projectId}/support`,
      },
    ],
    [ProjectType.DOCUMENT_SECURITY]: [
      {
        name: "Dashboard",
        icon: BarChart3,
        section: null,
        path: `/apps/${projectId}/dashboard`,
      },
      {
        name: "Documents",
        icon: FileLock,
        section: "dropdown",
        children: [
          {
            name: "Upload Document",
            icon: FileLock,
            path: `/apps/${projectId}/documents/upload`,
          },
          {
            name: "Document History",
            icon: FileText,
            path: `/apps/${projectId}/documents/history`,
          },
          // { name: "Share Securely", icon: FileText, path: `/apps/${projectId}/documents/share` }, // Not MVP
        ],
      },
      {
        name: "Settings",
        icon: SettingsIcon,
        section: null,
        path: `/apps/${projectId}/settings`,
      },
      {
        name: "Support",
        icon: HelpCircle,
        section: null,
        path: `/apps/${projectId}/support`,
      },
    ],
    [ProjectType.ALL_SERVICES]: [
      {
        name: "Dashboard",
        icon: BarChart3,
        section: null,
        path: `/apps/${projectId}/dashboard`,
      },
      {
        name: "Email Management",
        icon: Mail,
        section: "dropdown",
        children: [
          { name: "Inbox", icon: Mail, path: `/apps/${projectId}/email/inbox` },
          // { name: "Automated Orders", icon: FileText, path: `/apps/${projectId}/email/orders` }, // Not MVP
          // { name: "Threat Detection", icon: Shield, path: `/apps/${projectId}/email/threats` }, // Not MVP
          // { name: "Auto-Save", icon: FileText, path: `/apps/${projectId}/email/autosave` }, // Not MVP
          // { name: "Settings", icon: SettingsIcon, path: `/apps/${projectId}/email/settings` }, // Not MVP
        ],
      },
      {
        name: "Documents",
        icon: FileLock,
        section: "dropdown",
        children: [
          {
            name: "Upload Document",
            icon: FileLock,
            path: `/apps/${projectId}/documents/upload`,
          },
          {
            name: "Document History",
            icon: FileText,
            path: `/apps/${projectId}/documents/history`,
          },
          // { name: "Share Securely", icon: FileText, path: `/apps/${projectId}/documents/share` }, // Not MVP
        ],
      },
      {
        name: "Invoicing",
        icon: FileLock,
        section: "dropdown",
        children: [
          {
            name: "Create Invoice",
            icon: FileLock,
            path: `/apps/${projectId}/invoicing/create`,
          },
          {
            name: "Invoice History",
            icon: FileText,
            path: `/apps/${projectId}/invoicing/history`,
          },
          // { name: "Payments", icon: CreditCard, path: `/apps/${projectId}/invoicing/payments` }, // Not MVP
        ],
      },
      // {
      //   name: "Clients",
      //   icon: MessageCircle,
      //   section: "dropdown",
      //   children: [ ... ] // Not MVP
      // },
      // {
      //   name: "Expenses",
      //   icon: Receipt,
      //   section: "dropdown",
      //   children: [ ... ] // Not MVP
      // },
      // {
      //   name: "Taxes",
      //   icon: DollarSign,
      //   section: "dropdown",
      //   children: [ ... ] // Not MVP
      // },
      // {
      //   name: "Integrations",
      //   icon: Key,
      //   section: "dropdown",
      //   children: [ ... ] // Not MVP
      // },
      // {
      //   name: "Subscriptions",
      //   icon: CreditCard,
      //   section: null,
      //   path: `/apps/${projectId}/subscriptions`, // Not MVP
      // },
      // {
      //   name: "Calendar",
      //   icon: Calendar,
      //   section: null,
      //   path: `/apps/${projectId}/calendar`, // Not MVP
      // },
      {
        name: "Settings",
        icon: SettingsIcon,
        section: null,
        path: `/apps/${projectId}/settings`,
      },
      {
        name: "Support",
        icon: HelpCircle,
        section: null,
        path: `/apps/${projectId}/support`,
      },
    ],
  };

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setIsLoading(true);
      try {
        const res = await fetchProjectInformation(projectId);
        setProjectDetails(res);
      } catch (error) {
        console.log(error);
        toast.error("Error while fetching project details. Try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjectDetails();
  }, [projectId]);

  useEffect(() => {
    // Restore expanded sections from localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sidebar_expanded_sections");
      if (stored) setExpandedSections(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    // Persist expanded sections to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "sidebar_expanded_sections",
        JSON.stringify(expandedSections)
      );
    }
  }, [expandedSections]);

  useEffect(() => {
    // Auto-expand parent section if current route is a child nav
    if (projectDetails) {
      const navItems =
        navItemsByService[projectDetails.service as ProjectType] ||
        navItemsByService[ProjectType.ALL_SERVICES];
      navItems.forEach((item) => {
        if (item.children) {
          item.children.forEach((child) => {
            if (child.path === pathname) {
              setExpandedSections((prev) => ({ ...prev, [item.name]: true }));
            }
          });
        }
      });
    }
  }, [projectDetails, pathname]);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      toggleSidebar();
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleItemClick = (
    itemName: string,
    path?: string,
    isChild: boolean = false
  ) => {
    if (path) {
      router.push(path);
    }
    if (isMobile && !isChild) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      toast.success("Logout successfully");
      router.push("/main");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error while logout. Try again later.");
    }
  };

  const renderNavItem = (item: NavItem, isChild: boolean = false) => {
    const isActive = pathname === item.path;
    const hasChildren = item.children && item.children.length > 0;
    const isSectionExpanded = expandedSections[item.name];

    return (
      <div key={item.name} className={isChild ? "ml-0" : ""}>
        <button
          onClick={() => {
            if (hasChildren && (isExpanded || isMobile)) {
              toggleSection(item.name);
            } else {
              handleItemClick(item.name, item.path, isChild);
            }
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-all duration-200 group relative ${
            isActive
              ? "text-indigo-600 light:bg-indigo-50 border-r-2 border-indigo-600"
              : "light:text-gray-700 text-primary light:hover:text-gray-900 dark:hover:bg-secondary light:hover:bg-gray-50"
          } ${!isExpanded && !isMobile && "justify-center px-2"} ${
            isChild ? "text-sm py-1.5 pl-9" : "text-sm"
          }`}
          aria-label={item.name}
        >
          <item.icon
            size={isChild ? 16 : 18}
            className={`flex-shrink-0 ${
              isActive ? "text-indigo-600" : "text-gray-500"
            }`}
          />
          {(isExpanded || isMobile) && (
            <>
              <span className="flex-grow font-medium">{item.name}</span>
              {hasChildren && (
                <div className="flex-shrink-0">
                  {isSectionExpanded ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </div>
              )}
            </>
          )}
        </button>
        <AnimatePresence initial={false}>
          {hasChildren && (isExpanded || isMobile) && (
            <motion.div
              key={item.name + "-children"}
              initial="collapsed"
              animate={isSectionExpanded ? "open" : "collapsed"}
              exit="collapsed"
              variants={{
                open: {
                  height: "auto",
                  opacity: 1,
                  transition: { duration: 0.25, ease: "easeInOut" },
                },
                collapsed: {
                  height: 0,
                  opacity: 0,
                  transition: { duration: 0.2, ease: "easeInOut" },
                },
              }}
              style={{ overflow: "hidden" }}
            >
              <div className="py-1">
                {item.children?.map((child) => renderNavItem(child, true))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-background">
      <div
        className={`flex items-center px-4 py-4 border-b border-border ${
          !isExpanded && !isMobile && "justify-center px-2"
        }`}
      >
        {(isExpanded || isMobile) && (
          <motion.div
            className="flex items-center gap-3 group"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="relative group">
              <div className="flex items-center justify-center bg-card border border-border rounded-md p-1 transition-all duration-300 ">
                <Server className="w-5 h-5 text-primary" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold tracking-wide text-foreground">
                {projectDetails?.name || "Loading..."}
              </h1>
              <p className="text-muted-foreground text-xs">
                {projectId.slice(0, 20)}...
              </p>
              {!projectDetails && isLoading === false && (
                <span className="text-destructive text-xs">
                  Failed to load project details
                </span>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <nav className="space-y-1">
          {(projectDetails
            ? navItemsByService[projectDetails.service as ProjectType] ||
              navItemsByService[ProjectType.ALL_SERVICES]
            : Array(navItemsByService[ProjectType.ALL_SERVICES].length).fill(
                null
              )
          ).map((item, index) => {
            if (item && typeof item === "object" && "section" in item) {
              return renderNavItem(item);
            } else {
              return (
                <div
                  key={index}
                  className="h-10 rounded-lg bg-card my-2 mx-2 animate-pulse"
                />
              );
            }
          })}
        </nav>
      </div>

      <div className="border-t border-border p-3">
        <button
          className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm font-medium  light:text-gray-700 hover:text-red-600 transition-all duration-200 group ${
            !isExpanded && !isMobile && "justify-center px-2"
          }`}
          aria-label="Logout"
          onClick={handleLogout}
        >
          <LogOut
            size={18}
            className="flex-shrink-0 light:text-gray-500 light:group-hover:text-red-600"
          />
          {(isExpanded || isMobile) && (
            <span className="group-hover:text-red-600">Back To Main</span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`
          ${
            isMobile
              ? `fixed top-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
                  isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                } w-72 h-full`
              : `fixed top-0 left-0 h-screen z-30 transition-all duration-300 ease-in-out ${
                  isExpanded ? "w-64" : "w-16"
                }`
          }
          bg-background border-r border-border shadow-sm
        `}
      >
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="absolute top-90 -right-3 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-background border border-border text-primary light:hover:text-gray-600 hover:bg-secondary light:hover:bg-gray-50 transition-all duration-200 shadow-sm"
            aria-label={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isExpanded ? (
              <ChevronLeft size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>
        )}
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;
