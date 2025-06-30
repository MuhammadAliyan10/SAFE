import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface TabItem {
  name: string;
  value: string;
  content?: string;
  component?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

interface TabsComponentProps {
  tabs: TabItem[];
  defaultValue: string;
  className?: string;
  variant?: "default" | "pills" | "cards";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  onValueChange?: (value: string) => void;
}

const TabsComponent: React.FC<TabsComponentProps> = ({
  tabs,
  defaultValue,
  className,
  variant = "default",
  size = "md",
  fullWidth = false,
  onValueChange,
}) => {
  const sizeClasses = {
    sm: "px-3 pb-2 pt-1.5 text-sm",
    md: "px-4 pb-3 pt-2 text-sm",
    lg: "px-6 pb-4 pt-3 text-base",
  };

  const getTabsListClasses = () => {
    const baseClasses = "justify-start rounded-none !bg-transparent p-0";

    if (variant === "pills") {
      return cn(baseClasses, "bg-muted rounded-lg p-1");
    }

    if (variant === "cards") {
      return cn(baseClasses, "border-b-0");
    }

    return cn(baseClasses, fullWidth ? "w-full" : "w-auto min-w-fit");
  };

  const getTabTriggerClasses = () => {
    const baseClasses = cn(
      "relative font-medium transition-all duration-200 focus-visible:ring-0 disabled:opacity-50 disabled:cursor-not-allowed",
      sizeClasses[size]
    );

    if (variant === "pills") {
      return cn(
        baseClasses,
        "rounded-md border-0 bg-transparent text-muted-foreground hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
      );
    }

    if (variant === "cards") {
      return cn(
        baseClasses,
        "rounded-t-lg border border-b-0 border-transparent bg-transparent text-muted-foreground hover:text-foreground hover:border-border data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:text-foreground"
      );
    }

    return cn(
      baseClasses,
      "rounded-none border-b-2 border-b-transparent tracking-wide bg-transparent text-muted-foreground shadow-none hover:text-foreground data-[state=active]:border-b-indigo-500 data-[state=active]:text-indigo-500 data-[state=active]:shadow-none"
    );
  };

  return (
    <div className={cn("w-full ", className)}>
      <Tabs
        defaultValue={defaultValue}
        className="relative w-full"
        onValueChange={onValueChange}
      >
        <div
          className={cn(
            variant === "default" && "w-full border-b border-border",
            variant === "cards" && "w-full"
          )}
        >
          <TabsList className={getTabsListClasses()}>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                disabled={tab.disabled}
                className={getTabTriggerClasses()}
              >
                <span className="flex items-center gap-2">
                  {tab.name}
                  {tab.badge && (
                    <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {tab.badge}
                    </span>
                  )}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="mt-6">
          {tabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="mt-0 space-y-4"
            >
              {tab.component || tab.content}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default TabsComponent;
