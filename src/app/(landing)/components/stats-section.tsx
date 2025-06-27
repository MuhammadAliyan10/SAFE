"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "./ui/animated-counter";

const stats = [
  {
    value: 99.9,
    suffix: "%",
    label: "Uptime Guarantee",
    description: "Enterprise-grade reliability",
  },
  {
    value: 500,
    suffix: "+",
    label: "Threats Blocked Daily",
    description: "AI-powered protection",
  },
  {
    value: 50,
    suffix: "ms",
    label: "Response Time",
    description: "Lightning-fast detection",
  },
  {
    value: 256,
    suffix: "-bit",
    label: "Encryption Standard",
    description: "Military-grade security",
  },
];

export function StatsSection() {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Trusted by <span className="text-gradient">Thousands</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our security solutions protect businesses worldwide with proven
            results
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="glass rounded-2xl p-8 hover:glass-hover transition-all duration-300">
                <div className="mb-4">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{stat.label}</h3>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
