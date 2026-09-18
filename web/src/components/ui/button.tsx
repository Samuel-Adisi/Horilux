import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "icon";

const base =
  "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0";

const variants: Record<Variant, string> = {
  primary: "border border-brand-800 bg-brand text-white shadow-raise hover:bg-brand-600",
  secondary: "border border-line-strong bg-field text-ink shadow-raise hover:bg-surface-hover hover:text-heading",
  ghost: "text-ink-subtle hover:bg-surface-hover hover:text-heading",
  danger: "border border-danger-100 bg-field text-danger hover:bg-danger-50",
  success: "border border-forest-600 bg-forest-600 text-white shadow-raise hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "h-7 px-2.5 text-xs",
  md: "h-9 px-3.5 text-xs",
  icon: "h-8 w-8",
};

function buttonClasses(variant: Variant = "secondary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", loading, icon, className, children, disabled, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={buttonClasses(variant, size, className)}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
});

export function ButtonLink({
  variant = "secondary",
  size = "md",
  icon,
  className,
  children,
  ...props
}: LinkProps & { variant?: Variant; size?: Size; icon?: ReactNode }) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {icon}
      {children}
    </Link>
  );
}
