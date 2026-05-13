import React, { forwardRef } from "react";

type ButtonBaseProps = {
  variant?: "primary" | "secondary" | "danger";
  fullWidth?: boolean;
  as?: React.ElementType;
};

export const Button = forwardRef<HTMLElement, ButtonBaseProps & React.HTMLAttributes<HTMLElement> & Record<string, any>>(
  ({ className = "", variant = "primary", fullWidth, as: Component = "button", children, ...props }, ref) => {
    const combinedClasses = ["button", variant, fullWidth ? "button-full" : "", className].filter(Boolean).join(" ");

    return (
      <Component ref={ref} className={combinedClasses.trim()} {...props}>
        {children}
      </Component>
    );
  }
);

Button.displayName = "Button";
