"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  Menu,
  X,
  MapPin,
  Search,
  Bell,
  Clock,
  ShieldCheck,
  ArrowRight,
  Users,
  BarChart3,
  Send,
  AlertTriangle,
  DollarSign,
  FileText,
  Upload,
  Settings,
  CreditCard,
  Globe,
  Lock,
  ShieldUser,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Category {
  name: string;
  count: number;
  icon: string;
}

interface Notification {
  id: number;
  title: string;
  description: string;
  user: string;
  userAvatar: string;
  status: string;
  type: string;
  due: string;
  image: string;
}

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar: string;
}

interface Stat {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const categories: Category[] = [
  { name: "Email", count: 120, icon: "📧" },
  { name: "Securing", count: 85, icon: "🔒" },
  { name: "AI Suggestions", count: 53, icon: "🤖" },
  { name: "Invoices", count: 45, icon: "📄" },
  { name: "Taxes", count: 12, icon: "🏦" },
  { name: "Payments", count: 67, icon: "💳" },
];

const featuredNotifications: Notification[] = [
  {
    id: 1,
    title: "Unpaid Invoice #123",
    description: "Due tomorrow for client Alex K.",
    user: "System",
    userAvatar: "/api/placeholder/32/32",
    status: "Unread",
    type: "Email",
    due: "Tomorrow",
    image: "/Home/Invoice.png",
  },
  {
    id: 2,
    title: "Tax Deadline Approaching",
    description: "FBR tax filing due in 5 days",
    user: "System",
    userAvatar: "/api/placeholder/32/32",
    status: "Read",
    type: "Push",
    due: "5 days",
    image: "/Home/Tax.png",
  },
  {
    id: 3,
    title: "Low Cash Flow Alert",
    description: "Predicted cash flow: 30K PKR next month",
    user: "System",
    userAvatar: "/api/placeholder/32/32",
    status: "Unread",
    type: "WhatsApp",
    due: "Next month",
    image: "/Home/CashFlow.png",
  },
  {
    id: 4,
    title: "Client Follow-Up",
    description: "Send reminder to Maya T. for overdue payment",
    user: "System",
    userAvatar: "/api/placeholder/32/32",
    status: "Unread",
    type: "Email",
    due: "Today",
    image: "/Home/Client.png",
  },
];

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Khan",
    role: "Freelancer",
    content:
      "SAFE streamlined my invoicing and tax management, saving me hours every week!",
    avatar: "/api/placeholder/40/40",
  },
  {
    id: 2,
    name: "Ahmed Raza",
    role: "Small Business Owner",
    content:
      "The cash flow predictions and AI-driven insights are a game-changer for my business.",
    avatar: "/api/placeholder/40/40",
  },
  {
    id: 3,
    name: "Priya Sharma",
    role: "Consultant",
    content:
      "The multi-currency support and secure integrations make SAFE perfect for my global clients.",
    avatar: "/api/placeholder/40/40",
  },
];

const stats: Stat[] = [
  {
    label: "Active Clients",
    value: "50+",
    icon: <Users className="h-4 w-4" />,
  },
  {
    label: "Invoices Processed",
    value: "1k+",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    label: "Average Response Time",
    value: "2 min",
    icon: <Clock className="h-4 w-4" />,
  },
  {
    label: "Security Rating",
    value: "99.9%",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
];

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);
    setIsOffline(!navigator.onLine);
    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="mb-4"
        >
          <ShieldUser className="h-12 w-12 text-primary" />
        </motion.div>
        <motion.h1
          className="text-2xl font-bold text-primary"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          SAFE
        </motion.h1>
        <p className="text-muted-foreground mt-2">
          Loading your financial management platform...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50"
          >
            <Alert variant="destructive" className="rounded-none border-b">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>You're offline</AlertTitle>
              <AlertDescription>
                Please check your internet connection to continue using SAFE.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-md border-b"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ShieldUser className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">SAFE</h1>
          </motion.div>

          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-4">
              <a
                href="#"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Dashboard
              </a>
              <a
                href="#"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Invoices
              </a>
              <a
                href="#"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Clients
              </a>
              <a
                href="#"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Settings
              </a>
            </nav>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Link href="/sign-in">Log In</Link>
              </Button>
              <Button size="sm">
                <Link href="/sign-up">Sign Up</Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-80">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <h2 className="font-bold">SAFE</h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <nav className="flex flex-col gap-4 py-4">
                    <a
                      href="#"
                      className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Invoices
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Clients
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Settings
                    </a>
                  </nav>
                  <div className="mt-auto flex flex-col gap-2 py-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Log In
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 dark:from-primary/10 dark:to-secondary/10" />

          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <motion.div
                className="flex flex-col gap-6"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <Badge variant="outline" className="w-fit">
                  Introducing SAFE
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Manage Finances <span className="text-primary">Securely</span>
                  <br />
                  Save Time & Money
                </h1>
                <p className="text-muted-foreground text-lg max-w-md">
                  Streamline invoicing, expense tracking, and client management
                  with AI-powered insights and secure integrations.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  <Button size="lg" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="lg">
                    How It Works
                  </Button>
                </div>

                <motion.div
                  className="flex flex-wrap gap-4 mt-4"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      variants={fadeIn}
                      className="bg-background/80 backdrop-blur-sm border rounded-lg px-4 py-2 flex items-center gap-2"
                    >
                      {stat.icon}
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {stat.label}
                        </p>
                        <p className="font-medium">{stat.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="aspect-square md:aspect-[4/3] bg-gradient-to-br from-primary/30 to-secondary/30 rounded-2xl overflow-hidden flex items-center justify-center relative">
                  <img
                    src="/DummyDashboard.png"
                    alt="SAFE Dashboard"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
                  />
                  <div className="relative z-10 flex flex-col items-center gap-6 p-6 text-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="bg-background/90 backdrop-blur-lg border rounded-xl p-4 shadow-lg max-w-xs"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <BarChart3 className="text-primary h-5 w-5" />
                        <h3 className="font-medium">Cash Flow Insights</h3>
                      </div>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Filter by period..."
                          className="pr-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                      className="w-full max-w-xs bg-background/90 backdrop-blur-lg rounded-xl border shadow-lg overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage
                              src="/Home/UserAvatar.jpg"
                              alt="Profile"
                            />
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">Unpaid Invoice</h3>
                            <p className="text-sm text-muted-foreground">
                              Due tomorrow
                            </p>
                          </div>
                          <Badge className="ml-auto">Email</Badge>
                        </div>
                      </div>
                      <div className="h-24 bg-accent flex items-center justify-center">
                        <img
                          src="Invoice.jpg"
                          alt="Invoice"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <motion.section
          className="py-16 md:py-24 bg-muted/50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4">
                How SAFE Secures Your Business
              </h2>
              <p className="text-muted-foreground">
                Our AI-powered platform delivers secure email services, SDKs,
                and financial tools for freelancers and businesses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <motion.div
                className="bg-background rounded-xl p-6 border shadow-sm flex flex-col items-center text-center"
                variants={fadeIn}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">
                  Secure Your Business
                </h3>
                <p className="text-muted-foreground">
                  AI-based secure email service, SDK, and code generation to
                  prevent hacking and protect your business.
                </p>
              </motion.div>

              <motion.div
                className="bg-background rounded-xl p-6 border shadow-sm flex flex-col items-center text-center"
                variants={fadeIn}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">
                  Freelancer Invoicing & Taxes
                </h3>
                <p className="text-muted-foreground">
                  Streamlined invoicing and tax assistance for freelancers and
                  businesses with AI-templated invoices and multi-currency
                  support.
                </p>
              </motion.div>

              <motion.div
                className="bg-background rounded-xl p-6 border shadow-sm flex flex-col items-center text-center"
                variants={fadeIn}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">
                  Best-in-Class Data Security
                </h3>
                <p className="text-muted-foreground">
                  AES-256 encryption, blockchain hashing and quantum algorithm
                  ensure your data is secure and tamper-proof.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="py-16 md:py-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">Browse Features</h2>
                <p className="text-muted-foreground max-w-2xl">
                  Explore tools to manage your finances, clients, and taxes
                  efficiently.
                </p>
              </div>
              <Button variant="ghost" className="w-fit">
                View All Features <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {categories.map((category, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-background border rounded-xl p-6 flex flex-col items-center text-center hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="font-medium mb-1">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {category.count} items
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          className="py-16 md:py-24 bg-muted/50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  Recent Notifications
                </h2>
                <p className="text-muted-foreground max-w-2xl">
                  Stay updated with alerts for invoices, taxes, and cash flow.
                </p>
              </div>
              <Tabs defaultValue="unread" className="w-full md:w-auto">
                <TabsList>
                  <TabsTrigger value="unread">Unread</TabsTrigger>
                  <TabsTrigger value="read">Read</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {featuredNotifications.map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Card className="overflow-hidden h-full flex flex-col">
                    <div className="h-48 relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-3 right-3 bg-background text-foreground">
                        {item.type}
                      </Badge>
                    </div>
                    <CardHeader className="py-4">
                      <div className="flex justify-between items-start">
                        <CardTitle>{item.title}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 -mt-1"
                        >
                          <Bell className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {item.due}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="py-0 flex-grow">
                      <p className="text-sm">{item.description}</p>
                      <div className="flex items-center gap-2 mt-4">
                        <p className="text-xs text-muted-foreground">
                          Status: {item.status}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t mt-4 pt-4">
                      <div className="flex items-center gap-2 w-full">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={item.userAvatar} alt={item.user} />
                          <AvatarFallback>{item.user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{item.user}</span>
                        <Button size="sm" variant="default" className="ml-auto">
                          Snooze
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <div className="flex justify-center mt-12">
              <Button>View All Notifications</Button>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="py-16 md:py-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Manage Clients Effectively
              </h2>
              <p className="text-muted-foreground">
                Track client details, invoices, and payments with our simple
                CRM.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="rounded-xl overflow-hidden border shadow-sm h-96 relative"
            >
              <img
                src="/Home/ClientDashboard.png"
                alt="Client Dashboard"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="bg-background border rounded-xl p-4 max-w-md mx-auto">
                  <h3 className="text-lg font-medium mb-2">
                    Find Client Details
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <Input
                      type="text"
                      placeholder="Search clients..."
                      className="flex-grow"
                    />
                    <Button>Search</Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-background/80">
                      Active
                    </Badge>
                    <Badge variant="outline" className="bg-background/80">
                      Overdue
                    </Badge>
                    <Badge variant="outline" className="bg-background/80">
                      Inactive
                    </Badge>
                    <Badge variant="outline" className="bg-background/80">
                      More...
                    </Badge>
                  </div>
                </div>
              </div>

              <motion.div
                className="absolute top-1/4 left-1/4 h-6 w-6"
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  repeatType: "loop",
                }}
              >
                <div className="h-full w-full rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                </div>
              </motion.div>

              <motion.div
                className="absolute top-1/3 right-1/3 h-6 w-6"
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  repeatType: "loop",
                  delay: 0.5,
                }}
              >
                <div className="h-full w-full rounded-full bg-secondary/20 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-secondary" />
                </div>
              </motion.div>

              <motion.div
                className="absolute top-1/2 right-1/4 h-6 w-6"
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  repeatType: "loop",
                  delay: 1,
                }}
              >
                <div className="h-full w-full rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          className="py-16 md:py-24 bg-muted/50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="outline" className="mb-4">
                Why Choose SAFE
              </Badge>
              <h2 className="text-3xl font-bold mb-4">
                Secure Financial Management Platform
              </h2>
              <p className="text-muted-foreground">
                Leverage AI-driven insights and robust security for seamless
                financial operations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              <motion.div
                variants={fadeIn}
                className="bg-background rounded-xl p-6 border shadow-sm"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">
                  Automated Reminders
                </h3>
                <p className="text-muted-foreground">
                  Get notifications for unpaid invoices, tax deadlines, and low
                  cash flow via email, push, or WhatsApp.
                </p>
              </motion.div>

              <motion.div
                variants={fadeIn}
                className="bg-background rounded-xl p-6 border shadow-sm"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">
                  Multi-Currency Support
                </h3>
                <p className="text-muted-foreground">
                  Manage invoices and payments in PKR, USD, INR with real-time
                  conversion rates.
                </p>
              </motion.div>

              <motion.div
                variants={fadeIn}
                className="bg-background rounded-xl p-6 border shadow-sm"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Robust Security</h3>
                <p className="text-muted-foreground">
                  AES-256 encryption, GDPR/FBR compliance, and blockchain
                  document security.
                </p>
              </motion.div>

              <motion.div
                variants={fadeIn}
                className="bg-background rounded-xl p-6 border shadow-sm"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Client Management</h3>
                <p className="text-muted-foreground">
                  Simple CRM to track client details, invoices, and project
                  history.
                </p>
              </motion.div>

              <motion.div
                variants={fadeIn}
                className="bg-background rounded-xl p-6 border shadow-sm"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">
                  Payment Integration
                </h3>
                <p className="text-muted-foreground">
                  Supports JazzCash, Stripe, PayPal, and more with payment
                  splitting and refund tracking.
                </p>
              </motion.div>

              <motion.div
                variants={fadeIn}
                className="bg-background rounded-xl p-6 border shadow-sm"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Cash Flow Insights</h3>
                <p className="text-muted-foreground">
                  AI-driven predictions and interactive charts for income and
                  expenses.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="py-16 md:py-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
              <p className="text-muted-foreground">
                Join thousands of users managing their finances with SAFE.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-background rounded-xl p-6 border shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarImage
                        src={testimonial.avatar}
                        alt={testimonial.name}
                      />
                      <AvatarFallback>
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{testimonial.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="italic">{testimonial.content}</p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="text-yellow-500">
                        ★
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <section className="py-16 md:py-24 bg-primary/10">
          <motion.div
            className="container mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="bg-background rounded-2xl p-8 md:p-12 border shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">
                    Ready to Manage Your Finances?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Join SAFE today to streamline your invoicing, expense
                    tracking, and client management with AI-driven insights.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button size="lg" className="gap-2">
                      Create Account <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="lg">
                      Learn More
                    </Button>
                  </div>
                </div>

                <motion.div
                  className="relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl overflow-hidden flex items-center justify-center relative">
                    <img
                      src="/api/placeholder/600/400"
                      alt="SAFE in action"
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-16 w-16 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer">
                        <div className="h-14 w-14 bg-primary/90 rounded-full flex items-center justify-center">
                          <div className="ml-1 w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>

        <motion.section
          className="py-16 md:py-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
              <p className="text-muted-foreground mb-6">
                Get notified about new features, financial insights, and tax
                deadlines.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-grow"
                />
                <Button className="gap-2">
                  Subscribe <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                We respect your privacy and will never share your information.
              </p>
            </div>
          </div>
        </motion.section>
      </main>

      <footer className="bg-muted/50 border-t pt-12 pb-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold">SAFE</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                The ultimate financial management platform with AI insights and
                robust security.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
                  </svg>
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Security
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    FAQs
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4">Features</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Fast Invoicing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Expense Tracking
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Client Management
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Tax Management
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Multi-Currency Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-muted-foreground">
                  support@safeplatform.com
                </li>
                <li className="text-muted-foreground">+92 (321) 987-6543</li>
                <li className="text-muted-foreground">
                  456 Finance Street, Karachi
                </li>
              </ul>
              <Button variant="outline" className="mt-4">
                Contact Us
              </Button>
            </div>
          </div>

          <div className="border-t mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 SAFE. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
