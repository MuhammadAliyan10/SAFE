"use client";
import { logout } from "@/app/(auth)/actions";
import { fetchProjectInformation } from "@/app/actions/main";
import { motion } from "framer-motion";
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
  }>({});
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
          {
            name: "Automated Orders",
            icon: FileText,
            path: `/apps/${projectId}/email/orders`,
          },
          {
            name: "Threat Detection",
            icon: Shield,
            path: `/apps/${projectId}/email/threats`,
          },
          {
            name: "Auto-Save",
            icon: FileText,
            path: `/apps/${projectId}/email/autosave`,
          },
          {
            name: "Settings",
            icon: SettingsIcon,
            path: `/apps/${projectId}/email/settings`,
          },
        ],
      },
      {
        name: "Security",
        icon: Shield,
        section: "dropdown",
        children: [
          {
            name: "2FA Setup",
            icon: Lock,
            path: `/apps/${projectId}/security/2fa`,
          },
          {
            name: "Threat Alerts",
            icon: Shield,
            path: `/apps/${projectId}/security/threats`,
          },
          {
            name: "SDKs & Code",
            icon: Code,
            path: `/apps/${projectId}/security/sdks`,
          },
          {
            name: "Hosting Protection",
            icon: Store,
            path: `/apps/${projectId}/security/hosting`,
          },
          {
            name: "Audit Logs",
            icon: FileText,
            path: `/apps/${projectId}/security/audit`,
          },
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
          {
            name: "Payments",
            icon: CreditCard,
            path: `/apps/${projectId}/invoicing/payments`,
          },
        ],
      },
      {
        name: "Clients",
        icon: MessageCircle,
        section: "dropdown",
        children: [
          {
            name: "Manage Clients",
            icon: MessageCircle,
            path: `/apps/${projectId}/clients/manage`,
          },
          {
            name: "Client History",
            icon: FileText,
            path: `/apps/${projectId}/clients/history`,
          },
        ],
      },
      {
        name: "Expenses",
        icon: Receipt,
        section: "dropdown",
        children: [
          {
            name: "Add Expense",
            icon: Receipt,
            path: `/apps/${projectId}/expenses/add`,
          },
          {
            name: "Expense History",
            icon: FileText,
            path: `/apps/${projectId}/expenses/history`,
          },
        ],
      },
      {
        name: "Taxes",
        icon: DollarSign,
        section: "dropdown",
        children: [
          {
            name: "Tax Summary",
            icon: DollarSign,
            path: `/apps/${projectId}/taxes/summary`,
          },
          {
            name: "Export Reports",
            icon: FileText,
            path: `/apps/${projectId}/taxes/export`,
          },
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
            name: "Share Securely",
            icon: FileText,
            path: `/apps/${projectId}/documents/share`,
          },
          {
            name: "Document History",
            icon: FileText,
            path: `/apps/${projectId}/documents/history`,
          },
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
          {
            name: "Automated Orders",
            icon: FileText,
            path: `/apps/${projectId}/email/orders`,
          },
          {
            name: "Threat Detection",
            icon: Shield,
            path: `/apps/${projectId}/email/threats`,
          },
          {
            name: "Auto-Save",
            icon: FileText,
            path: `/apps/${projectId}/email/autosave`,
          },
          {
            name: "Settings",
            icon: SettingsIcon,
            path: `/apps/${projectId}/email/settings`,
          },
        ],
      },
      {
        name: "Security",
        icon: Shield,
        section: "dropdown",
        children: [
          {
            name: "2FA Setup",
            icon: Lock,
            path: `/apps/${projectId}/security/2fa`,
          },
          {
            name: "Threat Alerts",
            icon: Shield,
            path: `/apps/${projectId}/security/threats`,
          },
          {
            name: "SDKs & Code",
            icon: Code,
            path: `/apps/${projectId}/security/sdks`,
          },
          {
            name: "Hosting Protection",
            icon: Store,
            path: `/apps/${projectId}/security/hosting`,
          },
          {
            name: "Audit Logs",
            icon: FileText,
            path: `/apps/${projectId}/security/audit`,
          },
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
            name: "Share Securely",
            icon: FileText,
            path: `/apps/${projectId}/documents/share`,
          },
          {
            name: "Document History",
            icon: FileText,
            path: `/apps/${projectId}/documents/history`,
          },
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
          {
            name: "Payments",
            icon: CreditCard,
            path: `/apps/${projectId}/invoicing/payments`,
          },
        ],
      },
      {
        name: "Clients",
        icon: MessageCircle,
        section: "dropdown",
        children: [
          {
            name: "Manage Clients",
            icon: MessageCircle,
            path: `/apps/${projectId}/clients/manage`,
          },
          {
            name: "Client History",
            icon: FileText,
            path: `/apps/${projectId}/clients/history`,
          },
        ],
      },
      {
        name: "Expenses",
        icon: Receipt,
        section: "dropdown",
        children: [
          {
            name: "Add Expense",
            icon: Receipt,
            path: `/apps/${projectId}/expenses/add`,
          },
          {
            name: "Expense History",
            icon: FileText,
            path: `/apps/${projectId}/expenses/history`,
          },
        ],
      },
      {
        name: "Taxes",
        icon: DollarSign,
        section: "dropdown",
        children: [
          {
            name: "Tax Summary",
            icon: DollarSign,
            path: `/apps/${projectId}/taxes/summary`,
          },
          {
            name: "Export Reports",
            icon: FileText,
            path: `/apps/${projectId}/taxes/export`,
          },
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
            path: `/apps/${projectId}/integrations/payments`,
          },
          {
            name: "Storefronts",
            icon: Store,
            path: `/apps/${projectId}/integrations/storefronts`,
          },
        ],
      },
      {
        name: "Subscriptions",
        icon: CreditCard,
        section: null,
        path: `/apps/${projectId}/subscriptions`,
      },
      {
        name: "Calendar",
        icon: Calendar,
        section: null,
        path: `/apps/${projectId}/calendar`,
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
        {hasChildren && (isExpanded || isMobile) && isSectionExpanded && (
          <div className="py-1">
            {item.children?.map((child) => renderNavItem(child, true))}
          </div>
        )}
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
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative">
              <motion.div
                className="w-11 h-11 rounded-2xl flex items-center justify-center relative overflow-hidden"
                animate={{
                  background: [
                    "linear-gradient(45deg, #8b5cf6, #3b82f6)",
                    "linear-gradient(45deg, #3b82f6, #8b5cf6)",
                    "linear-gradient(45deg, #8b5cf6, #3b82f6)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <ShieldCheck className="w-6 h-6 text-white relative z-10" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                  animate={{ x: [-100, 100] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </motion.div>
              <div className="absolute -inset-2 bg-gradient-to-r from-violet-500 to-blue-500 rounded-2xl opacity-30 blur-lg" />
            </div>
            <div>
              <h1 className="text-xl dark:font-black bg-gradient-to-r from-white via-violet-200 to-blue-200 bg-clip-text text-transparent">
                {projectDetails?.name || "Loading..."}
              </h1>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <nav className="space-y-1">
          {(projectDetails
            ? navItemsByService[projectDetails.service as ProjectType] ||
              navItemsByService[ProjectType.ALL_SERVICES]
            : []
          ).map((item) => renderNavItem(item))}
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
      {isMobile && (
        <button
          onClick={handleToggleSidebar}
          className="fixed top-4 left-4 z-50 md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-background shadow-sm border border-border hover:bg-background/10 transition-all duration-200"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

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
