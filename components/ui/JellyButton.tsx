"use client";

import { motion } from "framer-motion";
import { type ReactNode, type ComponentPropsWithoutRef } from "react";

type JellyButtonProps = ComponentPropsWithoutRef<"button"> & {
  children: ReactNode;
  asChild?: false;
};

export function JellyButton({
  children,
  className,
  disabled,
  ...props
}: JellyButtonProps) {
  return (
    <motion.button
      {...props}
      disabled={disabled}
      className={className}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
}
