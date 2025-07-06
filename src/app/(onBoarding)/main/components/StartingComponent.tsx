"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  FileText,
  Lock,
  ShieldCheck,
  ArrowRight,
  Plus,
  Calendar,
  ChevronRight,
  Search,
  Grid3X3,
  List,
  Sun,
  Moon,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Filter,
  User,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fetchProjects, createProject, deleteProject } from "../actions";
import { useSession } from "@/provider/SessionProvider";

interface ProjectFormInputs {
  name: string;
  description: string;
  workingEmail?: string;
  clientEmail?: string;
  documentType?: string;
  generalNote?: string;
}

interface Service {
  name: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  service: string;
  status: "Active" | "Completed" | "Paused" | "Draft";
  createdAt: string;
  lastModified: string;
  progress: number;
  assignedUsers?: { id: string; name: string; avatar?: string }[];
}

const services: Service[] = [
  {
    name: "Business Security",
    value: "BUSINESS_SECURITY",
    description: "AI-based secure email, SDK, and code generation",
    icon: <Lock className="h-6 w-6" />,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    name: "Invoicing",
    value: "INVOICING",
    description: "Streamlined invoicing and tax assistance",
    icon: <FileText className="h-6 w-6" />,
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  {
    name: "Document Security",
    value: "DOCUMENT_SECURITY",
    description: "AES-256 encryption and blockchain hashing",
    icon: <ShieldCheck className="h-6 w-6" />,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  {
    name: "All Services",
    value: "ALL_SERVICES",
    description: "Comprehensive access to all features",
    icon: <Server className="h-6 w-6" />,
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterService, setFilterService] = useState<string>("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [projectFetchLoading, setProjectFetchLoading] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProjectFormInputs>({
    defaultValues: {
      name: "",
      description: "",
      workingEmail: "",
      clientEmail: "",
      documentType: "",
      generalNote: "",
    },
  });

  useEffect(() => {
    const loadProjects = async () => {
      setProjectFetchLoading(true);
      if (!user) return;
      try {
        const fetchedProjects = await fetchProjects(user.id);
        setProjects(fetchedProjects);
      } catch (error) {
        console.error("Error loading projects:", error);
        setError("Failed to load projects");
      } finally {
        setProjectFetchLoading(false);
      }
    };
    loadProjects();
  }, [user]);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      project.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesService =
      filterService === "all" || project.service === filterService;
    return matchesSearch && matchesStatus && matchesService;
  });

  const onSubmit: SubmitHandler<ProjectFormInputs> = async (data) => {
    if (!selectedService || !user) return;

    setIsLoading(true);
    setError(null);
    try {
      const newProject = await createProject(data, selectedService, user.id);
      setProjects((prev) => [newProject, ...prev]);
      setIsDialogOpen(false);
      reset();
      setSelectedService(null);
    } catch (error: any) {
      console.error("Error creating project:", error);
      setError(error.message || "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
      setError("Failed to delete project");
    }
  };

  const getServiceInfo = (serviceValue: string) => {
    return services.find((s) => s.value === serviceValue) || services[0];
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  const capitalizeTitle = (title: string) => {
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  return (
    <div className="flex flex-col min-h-screen w-full items-center justify-center bg-gradient-to-br from-black via-gray-900 to-slate-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-800/25 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-zinc-800/15 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-20 right-20 w-60 h-60 bg-stone-800/20 rounded-full blur-2xl animate-pulse delay-700"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-neutral-800/15 rounded-full blur-2xl animate-pulse delay-300"></div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.profileImage || ""} alt={user.username} />
              <AvatarFallback>
                {user.username?.[0].toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl font-bold text-primary">
                {capitalizeTitle(user.username)}'s Projects
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your projects and services
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <motion.div variants={fadeIn} initial="hidden" animate="visible">
              <Button
                size="lg"
                className="rounded-xl flex gap-2 items-center hover:cursor-pointer px-4 py-2 border border-border bg-primary/10 backdrop-blur-sm text-sm font-normal text-primary hover:bg-primary-20"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                New Project
              </Button>
            </motion.div>
          </div>
        </header>

        <Separator className="my-6" />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-destructive/10 text-destructive rounded-xl shadow-sm"
          >
            {error}
          </motion.div>
        )}

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-8"
        >
          <Card className="border border-border shadow-xl bg-background/95 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rounded-xl border-muted/30 focus:border-primary/50 transition-all duration-300"
                  />
                </div>
                <div className="flex gap-3">
                  <Select
                    value={filterService}
                    onValueChange={setFilterService}
                  >
                    <SelectTrigger className="w-[180px] rounded-xl">
                      <SelectValue placeholder="Service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      {services.map((service) => (
                        <SelectItem key={service.value} value={service.value}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setViewMode(viewMode === "grid" ? "list" : "grid")
                          }
                          className="rounded-xl"
                        >
                          {viewMode === "grid" ? (
                            <List className="h-5 w-5" />
                          ) : (
                            <Grid3X3 className="h-5 w-5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Switch to {viewMode === "grid" ? "list" : "grid"} view
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {projectFetchLoading ? (
          <div className="flex w-full justify-center items-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
            <span className="ml-3 text-lg text-muted-foreground">
              Loading projects...
            </span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {filteredProjects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex items-center justify-center"
              >
                <Card className="border-0 shadow-xl bg-background/95 backdrop-blur-md w-full max-w-lg">
                  <CardContent className="p-10 text-center flex flex-col justify-center items-center">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                      <FileText className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">
                      No Projects Found
                    </h3>
                    <p className="text-muted-foreground mb-6 text-lg">
                      {searchTerm ||
                      filterStatus !== "all" ||
                      filterService !== "all"
                        ? "Try adjusting your search or filters"
                        : "Start by creating your first project"}
                    </p>
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      className="rounded-xl flex gap-2 items-center hover:cursor-pointer px-4 py-2 border border-border bg-primary/10 backdrop-blur-sm text-sm font-normal text-primary hover:bg-primary-20"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create Project
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
                    : "space-y-6"
                }
                variants={stagger}
                initial="hidden"
                animate="visible"
              >
                {filteredProjects.map((project) => {
                  const serviceInfo = getServiceInfo(project.service);
                  return (
                    <motion.div
                      key={project.id}
                      variants={fadeIn}
                      whileHover={{
                        scale: 1.03,
                        transition: { duration: 0.2 },
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Card className="group hover:shadow-2xl transition-all duration-300 border-border hover:border-primary/50 bg-background/95 backdrop-blur-md">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                              <div
                                className={`w-12 h-12 rounded-xl ${serviceInfo.color} flex items-center justify-center transition-transform group-hover:scale-105`}
                              >
                                {serviceInfo.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-xl truncate">
                                  {project.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {serviceInfo.name}
                                </p>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                                >
                                  <MoreVertical className="h-5 w-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="rounded-xl"
                              >
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/apps/${project.id}/dashboard`)
                                  }
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() =>
                                    handleDeleteProject(project.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {project.description}
                          </p>

                          {project.assignedUsers && (
                            <div className="flex -space-x-2">
                              {project.assignedUsers.slice(0, 3).map((u) => (
                                <TooltipProvider key={u.id}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Avatar className="border-2 border-background">
                                        <AvatarImage
                                          src={u.avatar}
                                          alt={u.name}
                                        />
                                        <AvatarFallback>
                                          {u.name[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>{u.name}</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ))}
                              {project.assignedUsers.length > 3 && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Avatar className="border-2 border-background">
                                        <AvatarFallback>
                                          +{project.assignedUsers.length - 3}
                                        </AvatarFallback>
                                      </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {project.assignedUsers
                                        .slice(3)
                                        .map((u) => u.name)
                                        .join(", ")}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          )}
                          <Separator />
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(
                                  project.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/apps/${project.id}/dashboard`)
                              }
                              className="text-primary hover:bg-primary/10 rounded-lg"
                            >
                              View Details{" "}
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!isLoading && !isSubmitting) {
            setIsDialogOpen(open);
            if (!open) {
              setSelectedService(null);
              reset();
              setError(null);
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-[650px] p-0 bg-background rounded-2xl shadow-2xl border-border bg-gradient-to-br from-black via-gray-900 to-slate-900">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {selectedService ? "Create New Project" : "Select a Service"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {selectedService
                ? "Enter project details to get started"
                : "Choose a service to create your project"}
            </p>
          </DialogHeader>
          <div className="p-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-destructive/10 text-destructive rounded-xl"
              >
                {error}
              </motion.div>
            )}
            {!selectedService ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                variants={stagger}
                initial="hidden"
                animate="visible"
              >
                {services.map((service, index) => (
                  <motion.div
                    key={index}
                    variants={fadeIn}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="w-full p-6 text-left bg-background border-2 border-muted/20 hover:border-primary/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                          onClick={() => setSelectedService(service.value)}
                          disabled={service.value !== "ALL_SERVICES"}
                        >
                          <div
                            className={`w-14 h-14 rounded-xl ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                          >
                            {service.icon}
                          </div>
                          <h3 className="font-semibold text-lg mb-2">
                            {service.name}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                            {service.description}
                          </p>
                        </button>
                      </TooltipTrigger>
                      {service.value !== "ALL_SERVICES" && (
                        <TooltipContent>
                          <p>This service is currently disabled</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-between p-4 bg-muted/10 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-xl ${
                        getServiceInfo(selectedService).color
                      } flex items-center justify-center`}
                    >
                      {getServiceInfo(selectedService).icon}
                    </div>
                    <span className="font-semibold text-lg">
                      {getServiceInfo(selectedService).name}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    Step 2 of 2
                  </Badge>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">
                      Project Name *
                    </Label>
                    <Input
                      id="name"
                      {...register("name", {
                        required: "Project name is required",
                        minLength: {
                          value: 3,
                          message: "Minimum 3 characters",
                        },
                        maxLength: {
                          value: 50,
                          message: "Maximum 50 characters",
                        },
                      })}
                      placeholder="Enter project name"
                      className="mt-1.5 rounded-xl border-muted/30 focus:border-primary/50 transition-all"
                      disabled={isLoading || isSubmitting}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium"
                    >
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      {...register("description", {
                        required: "Description is required",
                        minLength: {
                          value: 10,
                          message: "Minimum 10 characters",
                        },
                        maxLength: {
                          value: 500,
                          message: "Maximum 500 characters",
                        },
                      })}
                      placeholder="Describe your project goals"
                      rows={4}
                      className="mt-1.5 rounded-xl border-muted/30 focus:border-primary/50 resize-none"
                      disabled={isLoading || isSubmitting}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {selectedService === "BUSINESS_SECURITY" && (
                    <div>
                      <Label
                        htmlFor="workingEmail"
                        className="text-sm font-medium"
                      >
                        Working Email *
                      </Label>
                      <Input
                        id="workingEmail"
                        type="email"
                        {...register("workingEmail", {
                          required: "Working email is required",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Invalid email",
                          },
                        })}
                        placeholder="your@company.com"
                        className="mt-1.5 rounded-xl border-muted/30 focus:border-primary/50"
                        disabled={isLoading || isSubmitting}
                      />
                      {errors.workingEmail && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.workingEmail.message}
                        </p>
                      )}
                    </div>
                  )}

                  {selectedService === "INVOICING" && (
                    <div>
                      <Label
                        htmlFor="clientEmail"
                        className="text-sm font-medium"
                      >
                        Client Email *
                      </Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        {...register("clientEmail", {
                          required: "Client email is required",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Invalid email",
                          },
                        })}
                        placeholder="client@company.com"
                        className="mt-1.5 rounded-xl border-muted/30 focus:border-primary/50"
                        disabled={isLoading || isSubmitting}
                      />
                      {errors.clientEmail && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.clientEmail.message}
                        </p>
                      )}
                    </div>
                  )}

                  {selectedService === "DOCUMENT_SECURITY" && (
                    <div>
                      <Label
                        htmlFor="documentType"
                        className="text-sm font-medium"
                      >
                        Document Type *
                      </Label>
                      <Input
                        id="documentType"
                        {...register("documentType", {
                          required: "Document type is required",
                          minLength: {
                            value: 3,
                            message: "Minimum 3 characters",
                          },
                        })}
                        placeholder="e.g., Contract, Invoice"
                        className="mt-1.5 rounded-xl border-muted/30 focus:border-primary/50"
                        disabled={isLoading || isSubmitting}
                      />
                      {errors.documentType && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.documentType.message}
                        </p>
                      )}
                    </div>
                  )}

                  {selectedService === "ALL_SERVICES" && (
                    <div>
                      <Label
                        htmlFor="generalNote"
                        className="text-sm font-medium"
                      >
                        General Note *
                      </Label>
                      <Textarea
                        id="generalNote"
                        {...register("generalNote", {
                          required: "General note is required",
                          minLength: {
                            value: 10,
                            message: "Minimum 10 characters",
                          },
                          maxLength: {
                            value: 500,
                            message: "Maximum 500 characters",
                          },
                        })}
                        placeholder="Enter general note"
                        rows={3}
                        className="mt-1.5 rounded-xl border-muted/30 focus:border-primary/50 resize-none"
                        disabled={isLoading || isSubmitting}
                      />
                      {errors.generalNote && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.generalNote.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  {/* <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isLoading || isSubmitting}
                    className="rounded-xl hover:bg-muted/50"
                  >
                    Cancel
                  </Button> */}
                  {selectedService && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedService(null)}
                      disabled={isLoading || isSubmitting}
                      className="rounded-xl border-muted/30 hover:border-primary/50"
                    >
                      Back
                    </Button>
                  )}
                  {selectedService && (
                    <Button
                      type="submit"
                      className="rounded-xl flex gap-2 items-center hover:cursor-pointer px-4 py-2 border border-border bg-primary/10 backdrop-blur-sm text-sm font-normal text-primary hover:bg-primary-20"
                      disabled={isLoading || isSubmitting}
                    >
                      {isLoading || isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-5 w-5 mr-2" />
                      )}
                      Create Project
                    </Button>
                  )}
                </div>
              </motion.form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
