import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, Shield, TrendingUp, Users } from "lucide-react";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile on mount and when window resizes
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Skip effect on mobile
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !imageRef.current) return;

      const { left, top, width, height } =
        containerRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;

      imageRef.current.style.transform = `perspective(1000px) rotateY(${
        x * 2.5
      }deg) rotateX(${-y * 2.5}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const handleMouseLeave = () => {
      if (!imageRef.current) return;
      imageRef.current.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)`;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [isMobile]);

  useEffect(() => {
    // Skip parallax on mobile
    if (isMobile) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const elements = document.querySelectorAll(".parallax");
      elements.forEach((el) => {
        const element = el as HTMLElement;
        const speed = parseFloat(element.dataset.speed || "0.1");
        const yPos = -scrollY * speed;
        element.style.setProperty("--parallax-y", `${yPos}px`);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  return (
    <section
      className="overflow-hidden relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      id="hero"
      style={{
        padding: isMobile ? "100px 12px 40px" : "120px 20px 60px",
      }}
    >
      <div className="absolute -top-[10%] -right-[5%] w-1/2 h-[70%] bg-gradient-to-br from-blue-400 to-purple-600 opacity-10 blur-3xl rounded-full"></div>

      <div className=" px-4 sm:px-6 lg:px-8" ref={containerRef}>
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-center">
          <div className="w-full lg:w-1/2">
            <div
              className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-3 sm:mb-6 opacity-0 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <Shield className="w-4 h-4 mr-2" />
              <span>Secure Financial Platform</span>
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight opacity-0 animate-fade-in text-gray-900"
              style={{ animationDelay: "0.3s" }}
            >
              SAFE: Your All-in-One
              <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Financial Hub
              </span>
            </h1>

            <p
              style={{ animationDelay: "0.5s" }}
              className="text-lg sm:text-xl text-gray-600 mt-4 sm:mt-6 mb-6 sm:mb-8 leading-relaxed opacity-0 animate-fade-in"
            >
              Streamline your finances with AI-powered insights, automated
              invoicing, and secure client management. Perfect for freelancers
              and small businesses.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4  animate-fade-in"
              style={{ animationDelay: "0.7s" }}
            >
              <a
                href="#get-started"
                className="flex items-center justify-center group w-full sm:w-auto text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#features"
                className="flex items-center justify-center w-full sm:w-auto text-center border-2 border-gray-300 text-gray-700 font-semibold py-4 px-8 rounded-full hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
              >
                Learn More
              </a>
            </div>

            {/* Stats */}
            <div
              className="flex flex-wrap gap-6 mt-8 sm:mt-12 opacity-0 animate-fade-in"
              style={{ animationDelay: "0.9s" }}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">₨50K+</div>
                  <div className="text-sm text-gray-600">
                    Avg Monthly Savings
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">10K+</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 relative mt-6 lg:mt-0">
            <div className="relative transition-all duration-500 ease-out overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl bg-white p-8">
              {/* Dashboard Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Dashboard Overview
                  </h3>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-lg text-white">
                    <div className="text-sm opacity-90">Total Revenue</div>
                    <div className="text-2xl font-bold">₨2,45,000</div>
                    <div className="text-xs opacity-75">+12% this month</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-lg text-white">
                    <div className="text-sm opacity-90">Active Clients</div>
                    <div className="text-2xl font-bold">28</div>
                    <div className="text-xs opacity-75">+3 new clients</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Recent Invoices
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>Invoice #1234</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        Paid
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Invoice #1235</span>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                        Pending
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Invoice #1236</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        Draft
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="hidden lg:block absolute bottom-0 left-1/4 w-64 h-64 bg-purple-100/30 rounded-full blur-3xl -z-10 parallax"
        data-speed="0.05"
      ></div>
    </section>
  );
};

export default Hero;
