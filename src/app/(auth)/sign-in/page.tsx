"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Shield,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { login } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Enhanced form schema for validation
const formSchema = z.object({
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .toLowerCase(),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
  rememberMe: z.boolean().optional(),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const res = await login(values.email, values.password);
      if (!res.success) {
        setLoginAttempts((prev) => prev + 1);
        return toast.error(
          res.message || "Invalid credentials. Please try again."
        );
      }

      toast.success("Welcome back! Redirecting to your dashboard...");
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setLoginAttempts((prev) => prev + 1);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        ease: [0.4, 0.0, 0.2, 1],
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0.0, 0.2, 1],
      },
    },
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-black p-4">
      <motion.div
        className="w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Card className="border border-white/10 shadow-2xl shadow-black/50 bg-black/20 backdrop-blur-xl backdrop-saturate-150">
          <CardHeader className="space-y-2 pb-6">
            {/* <motion.div
              variants={itemVariants}
              className="flex items-center justify-center mb-2"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-2">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </motion.div> */}
            <motion.div variants={itemVariants}>
              <CardTitle className="text-2xl font-semibold text-white text-center tracking-tight">
                Welcome back
              </CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardDescription className="text-slate-300 text-center text-sm">
                Sign in to your account to continue where you left off
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6 px-6">
            {/* Login Attempts Warning */}
            {loginAttempts >= 3 && (
              <motion.div
                variants={itemVariants}
                className="flex items-center p-3 rounded-lg bg-amber-900/20 backdrop-blur-sm border border-amber-500/30"
              >
                <AlertCircle className="h-4 w-4 text-amber-400 mr-2 flex-shrink-0" />
                <p className="text-sm text-amber-300">
                  Multiple failed attempts detected. Please check your
                  credentials or reset your password.
                </p>
              </motion.div>
            )}

            {/* Social Login Options */}
            <motion.div variants={itemVariants}>
              {/* <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-11 border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm transition-colors"
                  disabled={isLoading}
                >
                  <Chrome className="h-4 w-4 mr-2" />
                  Google
                </Button>
                <Button
                  variant="outline"
                  className="h-11 border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm transition-colors"
                  disabled={isLoading}
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
              </div> */}

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/20" />
                </div>
                <span className="relative bg-black/40 backdrop-blur-sm px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  continue with email
                </span>
              </div>
            </motion.div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-200">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              type="email"
                              placeholder="Enter your email address"
                              {...field}
                              className="h-11 pl-10 border-white/20 bg-white/5 backdrop-blur-sm text-white placeholder:text-slate-400 focus:border-white/40 focus:bg-white/10 transition-colors"
                              disabled={isLoading}
                              autoComplete="email"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              {...field}
                              className="h-11 pr-10 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                              disabled={isLoading}
                              autoComplete="current-password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={isLoading}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-slate-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-slate-400" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div
                  className="flex items-center justify-between"
                  variants={itemVariants}
                >
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="rememberMe"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 dark:data-[state=checked]:bg-white dark:data-[state=checked]:border-white"
                          disabled={isLoading}
                        />
                        <label
                          htmlFor="rememberMe"
                          className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer"
                        >
                          Remember me
                        </label>
                      </div>
                    )}
                  />
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-medium text-slate-900 dark:text-white hover:underline underline-offset-4 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-medium transition-colors group"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </Form>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="pt-2">
              <div className="grid grid-cols-2 gap-3 text-center">
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  Reset Password
                </Link>
                <Link
                  href="/support"
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  Need Help?
                </Link>
              </div>
            </motion.div>
          </CardContent>

          <CardFooter className="pt-4">
            <motion.p
              className="text-center text-sm text-slate-600 dark:text-slate-400 w-full"
              variants={itemVariants}
            >
              Do not have an account?
              <Link
                href="/sign-up"
                className="font-medium text-slate-900 dark:text-white hover:underline underline-offset-4 transition-colors ml-1"
              >
                Create an account
              </Link>
            </motion.p>
          </CardFooter>
        </Card>

        {/* Security Notice */}
        <motion.div
          variants={itemVariants}
          className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400"
        >
          <Shield className="h-3 w-3 inline mr-1" />
          Protected by enterprise-grade security
        </motion.div>
      </motion.div>
    </div>
  );
}
