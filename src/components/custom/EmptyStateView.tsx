import * as React from "react";
import { cn } from "../../lib/utils";

const EmptyStateRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-center max-w-sm flex flex-col items-center py-12", className)}
    {...props}
  />
));
EmptyStateRoot.displayName = "EmptyStateRoot";

const EmptyStateIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const childElement = React.Children.only(children) as React.ReactElement;
  const clonedIcon = React.cloneElement(childElement, {
    className: cn("w-12 h-12 text-muted-foreground mb-4", childElement.props.className),
  });
  
  return (
    <div ref={ref} className={cn("", className)} {...props}>
      {clonedIcon}
    </div>
  );
});
EmptyStateIcon.displayName = "EmptyStateIcon";

const EmptyStateTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-balance text-2xl text-muted-foreground mb-4", className)}
    {...props}
  />
));
EmptyStateTitle.displayName = "EmptyStateTitle";

const EmptyStateDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-balance text-muted-foreground mb-4", className)}
    {...props}
  />
));
EmptyStateDescription.displayName = "EmptyStateDescription";

const EmptyStateAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    {...props}
  />
));
EmptyStateAction.displayName = "EmptyStateAction";

// Maintain original EmptyStateView for backward compatibility
function EmptyStateView({
  title,
  description,
  action,
  Icon,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
  Icon: React.ReactNode;
}) {
  return (
    <EmptyStateRoot>
      <EmptyStateIcon>{Icon}</EmptyStateIcon>
      <EmptyStateTitle>{title}</EmptyStateTitle>
      {description && <EmptyStateDescription>{description}</EmptyStateDescription>}
      <EmptyStateAction>{action}</EmptyStateAction>
    </EmptyStateRoot>
  );
}

export {
  EmptyStateRoot,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
  EmptyStateView,
}
