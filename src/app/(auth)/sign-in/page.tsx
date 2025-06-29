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
      <div className="flex min-h-screen w-full items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
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
    <div className="flex min-h-screen w-full items-center justify-center bg-white p-4">
      <motion.div
        className="w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Card className="border border-gray-200 shadow-xl shadow-gray-200/20 bg-white/10 backdrop-blur-lg backdrop-saturate-200">
          <CardHeader className="space-y-2 pb-6">
            <motion.div variants={itemVariants}>
              <CardTitle className="text-2xl font-semibold text-gray-800 text-center tracking-tight">
                Welcome back
              </CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardDescription className="text-gray-500 text-center text-sm">
                Sign in to your account to continue where you left off
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6 px-6">
            {loginAttempts >= 3 && (
              <motion.div
                variants={itemVariants}
                className="flex items-center p-3 rounded-lg bg-amber-100/20 backdrop-blur-sm border border-amber-300/30"
              >
                <AlertCircle className="h-4 w-4 text-amber-600 mr-2 flex-shrink-0" />
                <p className="text-sm text-amber-600">
                  Multiple failed attempts detected. Please check your
                  credentials or reset your password.
                </p>
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <span className="relative bg-white/10 backdrop-blur-sm px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              type="email"
                              placeholder="Enter your email address"
                              {...field}
                              className="h-11 pl-10 border-gray-300 bg-white/20 backdrop-blur-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white/30 transition-colors rounded-lg"
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
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              {...field}
                              className="h-11 pr-10 border-gray-300 bg-white/20 backdrop-blur-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white/30 transition-colors rounded-lg"
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
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
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
                          className="mt-0.5 data-[state=checked]:bg-gray-600 data-[state=checked]:border-gray-600 border-gray-400"
                          disabled={isLoading}
                        />
                        <label
                          htmlFor="rememberMe"
                          className="text-sm text-gray-500 cursor-pointer"
                        >
                          Remember me
                        </label>
                      </div>
                    )}
                  />
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-medium text-gray-800 hover:underline underline-offset-4 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gray-800 hover:bg-gray-900 text-white font-medium backdrop-blur-sm border border-gray-300 hover:border-gray-400 transition-colors rounded-lg group"
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
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
                >
                  Reset Password
                </Link>
                <Link
                  href="/support"
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
                >
                  Need Help?
                </Link>
              </div>
            </motion.div>
          </CardContent>

          <CardFooter className="pt-4">
            <motion.p
              className="text-center text-sm text-gray-500 w-full"
              variants={itemVariants}
            >
              Do not have an account?
              <Link
                href="/sign-up"
                className="font-medium text-gray-800 hover:underline underline-offset-4 transition-colors ml-1"
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
          <Shield className="h-3 w-3 inline mr-1" />
          Protected by enterprise-grade security
        </motion.div>
      </motion.div>
    </div>
  );
}
