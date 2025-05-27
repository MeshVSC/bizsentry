
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground", 
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4", className)} 
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

// Updated CardTitle to reflect H2 styling as per MetricCard/ChartCard visual hierarchy
const CardTitle = React.forwardRef<
  HTMLParagraphElement, 
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2 
    ref={ref}
    // Matches .h2-style from globals.css: text-2xl font-semibold text-foreground
    // For StatCard title, it's: text-sm font-medium text-muted-foreground
    // This means CardTitle might need to be more flexible or StatCard should use a different element for its title.
    // For now, let's keep a general style, and allow override via className.
    // The PRD specified H1 for PageHeader title and "text slot, font-size sm, color Text Mid" for MetricCard header.
    // Let's assume CardTitle by default is for more prominent titles within cards.
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-foreground", 
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p 
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  // Default padding p-4, but often overridden to pt-0 if header has p-4.
  // For MetricCard, content has p-4 pt-0. For ChartCard, content has p-4 pt-0.
  // Let's make the default p-4 and allow specific components to adjust.
  <div ref={ref} className={cn("p-4", className)} {...props} /> 
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 pt-0", className)} 
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
