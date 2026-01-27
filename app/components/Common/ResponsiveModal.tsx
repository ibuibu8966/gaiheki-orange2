"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
  full: "sm:max-w-[90vw]",
};

export function ResponsiveModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "lg",
}: ResponsiveModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className={cn(
          // モバイル: 画面下部に固定、フルワイド
          "max-w-full rounded-t-lg rounded-b-none fixed bottom-0 left-0 right-0 top-auto translate-x-0 translate-y-0",
          "max-h-[90vh] overflow-hidden flex flex-col p-0",
          // デスクトップ: 中央に配置
          "sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2",
          "sm:rounded-lg sm:max-h-[85vh]",
          sizeClasses[size]
        )}
      >
        <DialogHeader className="flex-shrink-0 border-b px-4 sm:px-6 py-4">
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {children}
        </div>

        {footer && (
          <DialogFooter className="flex-shrink-0 border-t px-4 sm:px-6 py-4">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ResponsiveModal;
