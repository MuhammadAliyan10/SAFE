import React from "react";
import { Separator } from "@/components/ui/separator";

type Props = {
  heading?: string;
  subtitle?: string;
  rightComponent?: React.ReactNode;
  showSeparator?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  icon: React.ReactNode;
  variant?: "primary" | "indigo";
};

const PageHeader = ({
  heading,
  subtitle,
  rightComponent,

  showSeparator = true,
  size = "md",
  className = "",
  icon,
  variant = "primary",
}: Props) => {
  const sizeClasses = {
    sm: {
      container: "py-4 gap-4",
      heading: "text-xl sm:text-2xl",
      subtitle: "text-sm",
      icon: "p-2.5 w-10 h-10",
    },
    md: {
      container: "py-6 gap-6",
      heading: "text-2xl sm:text-3xl",
      subtitle: "text-sm",
      icon: "p-3 w-12 h-12",
    },
    lg: {
      container: "py-8 gap-8",
      heading: "text-3xl sm:text-4xl",
      subtitle: "text-base",
      icon: "p-3.5 w-14 h-14",
    },
  };

  const iconVariantClasses = {
    primary: "border-primary text-primary",
    indigo: "border-indigo-500 text-indigo-500",
  };

  const currentSize = sizeClasses[size];
  const iconClasses = iconVariantClasses[variant];

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full flex flex-col ${currentSize.container}`}>
        {/* Main Header Row */}
        <div className="w-full flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex justify-start items-center gap-x-4">
            <div
              className={`
                ${currentSize.icon}
                ${iconClasses}
            flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10
              `}
            >
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              {heading && (
                <h1
                  className={`font-semibold tracking-wide text-foreground ${currentSize.heading}`}
                >
                  {heading}
                </h1>
              )}
              {subtitle && (
                <p
                  className={`mt-1 text-muted-foreground ${currentSize.subtitle} leading-relaxed`}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right Component */}
          {rightComponent && (
            <div className="flex-shrink-0 w-full sm:w-auto">
              <div className="flex justify-start sm:justify-end">
                {rightComponent}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Optional Separator */}
      {showSeparator && <Separator className="mt-2" />}
    </div>
  );
};
export default PageHeader;
