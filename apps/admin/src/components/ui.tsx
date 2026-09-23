"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

/**
 * LYNKO-X UI asoslari. Yangi sahifalar tugma, badge va input'ni shu yerdan oladi,
 * shunda ranglar va o'lchamlar hamma joyda bir xil bo'ladi. Qoidalar: DESIGN.md.
 */

export type ButtonVariant = "primary" | "secondary" | "accent" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500";

const VARIANT: Record<ButtonVariant, string> = {
  // Ekranda bitta asosiy harakat
  primary: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800",
  // Qolgan barcha harakatlar
  secondary: "border border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:text-gray-900",
  // Faqat eng muhim CTA (masalan, "Do'kon ochish"); matn har doim to'q
  accent: "bg-accent-500 text-gray-900 hover:bg-accent-400 active:bg-accent-600 shadow-md shadow-accent-500/25",
  danger: "border border-error-200 bg-white text-error-700 hover:bg-error-50 hover:border-error-300",
  ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className = "") {
  return `${BASE} ${VARIANT[variant]} ${SIZE[size]} ${className}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = "secondary",
  size = "md",
  className = "",
  external = false,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  external?: boolean;
  children: ReactNode;
}) {
  const cls = buttonClass(variant, size, className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "error" | "info";

const BADGE: Record<BadgeTone, string> = {
  neutral: "bg-gray-100 text-gray-600",
  primary: "bg-primary-50 text-primary-700",
  success: "bg-success-100 text-success-700",
  warning: "bg-warning-100 text-warning-700",
  error: "bg-error-100 text-error-700",
  info: "bg-info-100 text-info-700",
};

export function Badge({ tone = "neutral", className = "", children }: { tone?: BadgeTone; className?: string; children: ReactNode }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function Input({ className = "", invalid = false, ...props }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
        invalid ? "border-error-300 focus:ring-error-200" : "border-gray-300 focus:border-primary-500 focus:ring-primary-100"
      } ${className}`}
      {...props}
    />
  );
}

export function Field({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

/** Ogohlantirish yoki xato xabari; rang holatga qarab */
export function Alert({ tone = "info", children, className = "" }: { tone?: "info" | "success" | "warning" | "error"; children: ReactNode; className?: string }) {
  const map = {
    info: "bg-info-50 border-info-200 text-info-800",
    success: "bg-success-50 border-success-200 text-success-800",
    warning: "bg-warning-50 border-warning-200 text-warning-800",
    error: "bg-error-50 border-error-200 text-error-800",
  };
  return <div className={`rounded-lg border px-4 py-3 text-sm ${map[tone]} ${className}`}>{children}</div>;
}
