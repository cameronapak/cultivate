import React from 'react';

interface KbdProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Kbd = ({ children, ...props }: KbdProps) => {
  return (
    <kbd className="absolute right-1 top-1 bottom-0 group-hover:opacity-100 opacity-0 transition-opacity duration-300 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground" {...props}>
      {children}
    </kbd>
  );
};
