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
  CheckCircle2,
  XCircle,
  Shield,
  Mail,
  User,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { signup } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

const formSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be less than 20 characters")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, underscores, and hyphens"
      ),
    email: z.string().email("Please enter a valid email address").toLowerCase(),
    password: passwordSchema,
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const getPasswordStrength = (
  password: string
): { score: number; text: string; color: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const strength = {
    0: { text: "Very Weak", color: "bg-red-500" },
    1: { text: "Weak", color: "bg-red-400" },
    2: { text: "Fair", color: "bg-yellow-500" },
    3: { text: "Good", color: "bg-blue-500" },
    4: { text: "Strong", color: "bg-green-500" },
    5: { text: "Very Strong", color: "bg-green-600" },
  };

  return { score, ...strength[score as keyof typeof strength] };
};

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    text: "",
    color: "",
  });
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const watchedPassword = form.watch("password");

  useEffect(() => {
    if (watchedPassword) {
      setPasswordStrength(getPasswordStrength(watchedPassword));
    } else {
      setPasswordStrength({ score: 0, text: "", color: "" });
    }
  }, [watchedPassword]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const res = await signup(values.username, values.email, values.password);
      if (!res.success) {
        return toast.error(
          res.message || "Registration failed. Please try again."
        );
      }
      toast.success("Account created successfully", {
        description: "Navigating to dashboard..",
      });
      router.push("/main");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Error while creating account", {
        description: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-black via-gray-900 to-slate-900 relative overflow-hidden">
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
        <Card className="border border-gray-700/50 shadow-2xl bg-gradient-to-br from-gray-900/70 via-black/50 to-gray-800/60 backdrop-blur-2xl backdrop-saturate-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/25 via-zinc-900/15 to-gray-900/20 pointer-events-none"></div>

          <CardHeader className="space-y-2 pb-2 relative z-10">
            <motion.div variants={itemVariants}>
              <CardTitle className="text-2xl font-semibold text-gray-200 text-center tracking-tight">
                Create your account
              </CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardDescription className="text-gray-400 text-center text-sm">
                Join thousands of professionals already using our platform
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6 px-6 relative z-10">
            <motion.div variants={itemVariants}>
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-700/50" />
                </div>
                <span className="relative bg-gradient-to-r from-gray-900/60 via-black/50 to-gray-800/60 backdrop-blur-sm px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Or continue with email
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
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-300">
                          Username
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <Input
                              placeholder="Enter your username"
                              {...field}
                              className="h-11 pl-10 border-gray-700/50 bg-gradient-to-r from-gray-800/50 via-black/40 to-gray-900/50 backdrop-blur-sm text-gray-200 placeholder:text-gray-500 focus:border-gray-600/70 focus:bg-gradient-to-r focus:from-gray-800/70 focus:via-black/60 focus:to-gray-900/70 transition-all duration-200 rounded-lg hover:from-gray-800/60 hover:via-black/50 hover:to-gray-900/60"
                              disabled={isLoading}
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
                              placeholder="Create a strong password"
                              {...field}
                              className="h-11 pr-10 border-gray-700/50 bg-gradient-to-r from-gray-800/50 via-black/40 to-gray-900/50 backdrop-blur-sm text-gray-200 placeholder:text-gray-500 focus:border-gray-600/70 focus:bg-gradient-to-r focus:from-gray-800/70 focus:via-black/60 focus:to-gray-900/70 transition-all duration-200 rounded-lg hover:from-gray-800/60 hover:via-black/50 hover:to-gray-900/60"
                              disabled={isLoading}
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
                        {watchedPassword && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-500">
                                Password strength
                              </span>
                              <span
                                className={`font-medium ${
                                  passwordStrength.score >= 4
                                    ? "text-green-500"
                                    : passwordStrength.score >= 3
                                    ? "text-blue-500"
                                    : "text-red-500"
                                }`}
                              >
                                {passwordStrength.text}
                              </span>
                            </div>
                            <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                              <div
                                className={`${passwordStrength.color} h-1.5 rounded-full transition-all duration-300 ease-out`}
                                style={{
                                  width: `${
                                    (passwordStrength.score / 5) * 100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                        <FormMessage className="text-xs text-red-400" />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-300">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              {...field}
                              className="h-11 pr-10 border-gray-700/50 bg-gradient-to-r from-gray-800/50 via-black/40 to-gray-900/50 backdrop-blur-sm text-gray-200 placeholder:text-gray-500 focus:border-gray-600/70 focus:bg-gradient-to-r focus:from-gray-800/70 focus:via-black/60 focus:to-gray-900/70 transition-all duration-200 rounded-lg hover:from-gray-800/60 hover:via-black/50 hover:to-gray-900/60"
                              disabled={isLoading}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-gradient-to-r hover:from-gray-800/40 hover:via-black/30 hover:to-gray-900/40 text-gray-500 hover:text-gray-400"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              disabled={isLoading}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                              {field.value && watchedPassword && (
                                <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                                  {field.value === watchedPassword ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  )}
                                </div>
                              )}
                            </Button>
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
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-1 space-y-0 py-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-0.5 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-gray-700 data-[state=checked]:to-gray-800 data-[state=checked]:border-gray-700 border-gray-600/50 bg-gradient-to-r from-gray-800/50 via-black/30 to-gray-900/50 backdrop-blur-sm"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm text-gray-400 font-normal">
                            I agree to the{" "}
                            <Link
                              href="/terms"
                              className="font-medium text-gray-300 hover:text-gray-200 hover:underline underline-offset-4"
                            >
                              Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link
                              href="/privacy"
                              className="font-medium text-gray-300 hover:text-gray-200 hover:underline underline-offset-4"
                            >
                              Privacy Policy
                            </Link>
                          </FormLabel>
                          <FormMessage className="text-xs text-red-400" />
                        </div>
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-gray-800 via-black to-gray-900 hover:from-gray-700 hover:via-gray-900 hover:to-black text-gray-200 font-medium backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/70 transition-all duration-200 rounded-lg shadow-lg hover:shadow-black/50"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </motion.div>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="pt-2 relative z-10">
            <motion.p
              className="text-center text-sm text-gray-400 w-full"
              variants={itemVariants}
            >
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-medium text-gray-300 hover:text-gray-200 hover:underline underline-offset-4 transition-colors"
              >
                Sign in
              </Link>
            </motion.p>
          </CardFooter>
        </Card>

        <motion.div
          variants={itemVariants}
          className="mt-4 text-center text-xs text-gray-500"
        >
          <div className="flex items-center justify-center bg-gradient-to-r from-gray-800/40 via-black/30 to-gray-900/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700/30">
            <Shield className="h-3 w-3 inline mr-1" />
            Your data is encrypted and secure
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
