import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  Users,
  TrendingUp,
  FileText,
  Shield,
  Smartphone,
  Bot,
  Globe,
  Receipt,
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const FeatureCard = ({ icon, title, description, index }: FeatureCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={cn(
        "bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 border border-gray-100 hover:border-blue-200",
        "hover:bg-gradient-to-br hover:from-white hover:to-blue-50"
      )}
      style={{ animationDelay: `${0.1 * index}s` }}
    >
      <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center text-blue-600 mb-5">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const Features = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements = entry.target.querySelectorAll(".fade-in-element");
            elements.forEach((el, index) => {
              setTimeout(() => {
                el.classList.add("animate-fade-in");
              }, index * 100);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      className="py-16 md:py-20 pb-0 relative bg-gray-50"
      id="features"
      ref={sectionRef}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4 opacity-0 fade-in-element">
            <span>Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 opacity-0 fade-in-element text-gray-900">
            Everything You Need to <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Manage Your Finances
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto opacity-0 fade-in-element">
            From automated invoicing to AI-powered insights, SAFE provides all
            the tools freelancers and small businesses need to succeed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<FileText className="w-6 h-6" />}
            title="Smart Invoicing"
            description="Create and send professional invoices in seconds with AI-powered templates and automated payment reminders."
            index={0}
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Client Management"
            description="Track client relationships, project history, and communication all in one intuitive dashboard."
            index={1}
          />
          <FeatureCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Cash Flow Insights"
            description="AI predicts your cash flow and provides actionable insights to optimize your financial health."
            index={2}
          />
          <FeatureCard
            icon={<Receipt className="w-6 h-6" />}
            title="Expense Tracking"
            description="Scan receipts with OCR technology and let AI automatically categorize your business expenses."
            index={3}
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Bank-Grade Security"
            description="Your data is protected with AES-256 encryption and compliance with GDPR and FBR regulations."
            index={4}
          />
          <FeatureCard
            icon={<CreditCard className="w-6 h-6" />}
            title="Multi-Payment Support"
            description="Accept payments via JazzCash, Easypaisa, Sadapay, Stripe, PayPal, and more payment gateways."
            index={5}
          />
          <FeatureCard
            icon={<Bot className="w-6 h-6" />}
            title="AI-Powered Automation"
            description="Automate repetitive tasks with intelligent reminders, tax calculations, and financial predictions."
            index={6}
          />
          <FeatureCard
            icon={<Globe className="w-6 h-6" />}
            title="Multi-Currency"
            description="Work with clients globally using multiple currencies with real-time conversion rates."
            index={7}
          />
          <FeatureCard
            icon={<Smartphone className="w-6 h-6" />}
            title="Mobile & Web Access"
            description="Access your financial data anywhere with our responsive web app and mobile applications."
            index={8}
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
