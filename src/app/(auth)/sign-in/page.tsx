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
      router.push("/main");
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
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gray-800/20 backdrop-blur-xl rounded-full animate-pulse"></div>
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 relative z-10" />
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
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
      },
    },
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-black via-gray-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-800/25 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-zinc-800/15 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-20 right-20 w-60 h-60 bg-stone-800/20 rounded-full blur-2xl animate-pulse delay-700"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-neutral-800/15 rounded-full blur-2xl animate-pulse delay-300"></div>
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Card className="border border-gray-700/40 shadow-2xl bg-gradient-to-br from-black via-gray-900 to-slate-900 backdrop-blur-2xl backdrop-saturate-200 relative overflow-hidden">
          {/* Pure black/slate glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/60 via-black/50 to-slate-900/60 backdrop-blur-2xl pointer-events-none" />

          <CardHeader className="space-y-2 pb-6 relative z-10">
            <motion.div variants={itemVariants}>
              <CardTitle className="text-2xl font-semibold text-gray-200 text-center tracking-tight">
                Welcome back
              </CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardDescription className="text-gray-400 text-center text-sm">
                Sign in to your account to continue where you left off
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6 px-6 relative z-10">
            {loginAttempts >= 3 && (
              <motion.div
                variants={itemVariants}
                className="flex items-center p-3 rounded-lg bg-amber-500/20 backdrop-blur-sm border border-amber-400/30"
              >
                <AlertCircle className="h-4 w-4 text-amber-400 mr-2 flex-shrink-0" />
                <p className="text-sm text-amber-300">
                  Multiple failed attempts detected. Please check your
                  credentials or reset your password.
                </p>
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-700/50" />
                </div>
                <span className="relative bg-gray-900/40 backdrop-blur-sm px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        <FormLabel className="text-sm font-medium text-gray-300">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <Input
                              type="email"
                              placeholder="Enter your email address"
                              {...field}
                              className="h-11 pl-10 border-gray-700/50 bg-gradient-to-r from-gray-800/50 via-black/40 to-gray-900/50 backdrop-blur-sm text-gray-200 placeholder:text-gray-500 focus:border-gray-600/70 focus:bg-gradient-to-r focus:from-gray-800/70 focus:via-black/60 focus:to-gray-900/70 transition-all duration-200 rounded-lg hover:from-gray-800/60 hover:via-black/50 hover:to-gray-900/60"
                              disabled={isLoading}
                              autoComplete="email"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs text-red-400" />
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
                        <FormLabel className="text-sm font-medium text-gray-300">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              {...field}
                              className="h-11 pr-10 border-gray-700/50 bg-gradient-to-r from-gray-800/50 via-black/40 to-gray-900/50 backdrop-blur-sm text-gray-200 placeholder:text-gray-500 focus:border-gray-600/70 focus:bg-gradient-to-r focus:from-gray-800/70 focus:via-black/60 focus:to-gray-900/70 transition-all duration-200 rounded-lg hover:from-gray-800/60 hover:via-black/50 hover:to-gray-900/60"
                              disabled={isLoading}
                              autoComplete="current-password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-gradient-to-r hover:from-gray-800/40 hover:via-black/30 hover:to-gray-900/40 text-gray-500 hover:text-gray-400"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={isLoading}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs text-red-400" />
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
                          className="mt-0.5 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-gray-700 data-[state=checked]:to-gray-800 data-[state=checked]:border-gray-700 border-gray-600/50 bg-gradient-to-r from-gray-800/50 via-black/30 to-gray-900/50 backdrop-blur-sm"
                          disabled={isLoading}
                        />
                        <label
                          htmlFor="rememberMe"
                          className="text-sm text-gray-400 cursor-pointer"
                        >
                          Remember me
                        </label>
                      </div>
                    )}
                  />
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-medium text-gray-300 hover:text-gray-200 hover:underline underline-offset-4 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-gray-800 via-black to-gray-900 hover:from-gray-700 hover:via-gray-900 hover:to-black text-gray-200 font-medium backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/70 transition-all duration-200 rounded-lg group shadow-lg hover:shadow-black/50"
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

            <motion.div variants={itemVariants} className="pt-2">
              <div className="grid grid-cols-2 gap-3 text-center">
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-gray-500 hover:text-gray-400 transition-colors p-2 rounded-lg hover:bg-gradient-to-r hover:from-gray-800/50 hover:via-black/40 hover:to-gray-900/50 backdrop-blur-sm"
                >
                  Reset Password
                </Link>
                <Link
                  href="/support"
                  className="text-xs text-gray-500 hover:text-gray-400 transition-colors p-2 rounded-lg hover:bg-gradient-to-r hover:from-gray-800/50 hover:via-black/40 hover:to-gray-900/50 backdrop-blur-sm"
                >
                  Need Help?
                </Link>
              </div>
            </motion.div>
          </CardContent>

          <CardFooter className="pt-4 relative z-10">
            <motion.p
              className="text-center text-sm text-gray-400 w-full"
              variants={itemVariants}
            >
              Do not have an account?
              <Link
                href="/sign-up"
                className="font-medium text-gray-300 hover:text-gray-200 hover:underline underline-offset-4 transition-colors ml-1"
              >
                Create an account
              </Link>
            </motion.p>
          </CardFooter>
        </Card>

        <motion.div
          variants={itemVariants}
          className="mt-6 text-center text-xs text-gray-500"
        >
          <div className="flex items-center justify-center bg-gradient-to-r from-gray-800/40 via-black/30 to-gray-900/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700/30">
            <Shield className="h-3 w-3 inline mr-1" />
            Protected by enterprise-grade security
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
