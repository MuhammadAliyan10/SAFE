"use client";

import { motion } from "framer-motion";
import {
  Mail,
  Shield,
  Smartphone,
  DollarSign,
  FileText,
  Lock,
  Zap,
  Globe,
  Bot,
  Database,
} from "lucide-react";
import { FloatingCard } from "./ui/floating-card";

const services = [
  {
    icon: Mail,
    title: "Email Security Suite",
    description:
      "Comprehensive email protection powered by advanced AI algorithms",
    features: [
      "Gmail API integration with intelligent filtering",
      "AI-powered spam and phishing detection",
      "Automated purchase order management",
      "Real-time link scanning and web scraping",
      "Advanced social engineering protection",
    ],
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Shield,
    title: "API Security Platform",
    description:
      "Simplified security solutions designed for non-technical users",
    features: [
      "One-click Shopify integration",
      "Automated business security upgrades",
      "Real-time threat monitoring",
      "Simple dashboard for security management",
      "24/7 automated protection",
    ],
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "Startup Security Shield",
    description: "AI-driven security control for growing businesses",
    features: [
      "Ransomware protection with AI detection",
      "DDoS mitigation and prevention",
      "Easy-to-integrate SDK for websites",
      "Hosting configuration assistance",
      "Data leak prevention systems",
    ],
    color: "from-green-500 to-teal-500",
  },
  {
    icon: DollarSign,
    title: "Freelancer Finance AI",
    description:
      "Smart financial management for freelancers and small businesses",
    features: [
      "AI-powered invoicing and expense tracking",
      "Tax management and optimization",
      "Cash flow insights and predictions",
      "Client management and communication",
      "Payment integration and automation",
    ],
    color: "from-orange-500 to-red-500",
  },
  {
    icon: FileText,
    title: "Blockchain Document Security",
    description: "Immutable document storage with change detection",
    features: [
      "Blockchain-based document storage",
      "Tamper-proof sharing mechanisms",
      "Real-time change notifications",
      "Secure multi-party collaboration",
      "Audit trail and version control",
    ],
    color: "from-indigo-500 to-purple-500",
  },
];

export function ServicesSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Our <span className="text-gradient">Security Solutions</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive protection powered by cutting-edge AI, blockchain
            technology, and advanced network security protocols
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <FloatingCard key={index} delay={index * 0.1}>
              <div className="relative">
                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} mb-6`}
                >
                  <service.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Features List */}
                <ul className="space-y-3">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </FloatingCard>
          ))}
        </div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-bold mb-8">
            Built on{" "}
            <span className="text-gradient">Advanced Technologies</span>
          </h3>
          <div className="flex justify-center items-center gap-12 flex-wrap">
            <div className="flex items-center gap-3 text-blue-400">
              <Bot className="w-8 h-8" />
              <span className="font-semibold">Artificial Intelligence</span>
            </div>
            <div className="flex items-center gap-3 text-cyan-400">
              <Database className="w-8 h-8" />
              <span className="font-semibold">Blockchain</span>
            </div>
            <div className="flex items-center gap-3 text-purple-400">
              <Globe className="w-8 h-8" />
              <span className="font-semibold">Network Security</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
