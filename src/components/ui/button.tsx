import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-opacity duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Default: Black bg, white text (RYL Identity)
        default: "bg-foreground text-background hover:opacity-90",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
        // Outline: White border on black
        outline: "border border-foreground/30 bg-transparent text-foreground hover:bg-foreground/5",
        secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
        ghost: "hover:bg-secondary text-foreground",
        link: "text-foreground underline-offset-4 hover:underline",
        // Legacy variants mapped to new system
        gold: "bg-foreground text-background hover:opacity-90",
        subtle: "bg-secondary text-foreground border border-border/30 hover:bg-secondary/80",
        player: "bg-background/20 backdrop-blur-sm text-foreground hover:bg-background/30 rounded-full",
        premium: "border border-foreground/30 text-foreground hover:bg-foreground/10",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
