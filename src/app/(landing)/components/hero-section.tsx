"use client";

import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 hero-glow" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(120,119,198,0.1)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(56,189,248,0.1)_0%,transparent_50%)]" />

      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 left-20 w-4 h-4 bg-blue-500 rounded-full opacity-50"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 right-32 w-6 h-6 bg-cyan-500 rounded-full opacity-30"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 left-1/4 w-8 h-8 bg-purple-500 rounded-full opacity-20"
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-6 z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Logo Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-6 pulse-glow"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold mb-6 tracking-tight"
          >
            <span className="text-gradient">S A F E</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Advanced Security Solutions Powered by{" "}
            <span className="text-blue-400 font-semibold">
              Artificial Intelligence
            </span>
            ,{" "}
            <span className="text-cyan-400 font-semibold">
              Blockchain Technology
            </span>
            , and{" "}
            <span className="text-purple-400 font-semibold">
              Network Security
            </span>
          </motion.p>

          {/* Features Icons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex justify-center items-center gap-8 mb-10"
          >
            <div className="flex items-center gap-2 text-blue-400">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-medium">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-400">
              <Lock className="w-5 h-5" />
              <span className="text-sm font-medium">Blockchain Secure</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Enterprise Grade</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 px-8 py-6 text-lg font-semibold rounded-xl backdrop-blur-sm"
            >
              Learn More
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-16 text-center"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Trusted by businesses worldwide
            </p>
            <div className="flex justify-center items-center gap-8 opacity-60">
              <div className="text-xs font-mono">Enterprise Security</div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full" />
              <div className="text-xs font-mono">24/7 Protection</div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full" />
              <div className="text-xs font-mono">AI-Driven Defense</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
