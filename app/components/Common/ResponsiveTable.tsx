"use client";

import { useState, useEffect, ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => ReactNode;
  hideOnMobile?: boolean;
  priority?: number;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  mobileCardTitle?: (item: T) => ReactNode;
  mobileCardActions?: (item: T) => ReactNode;
}

function LoadingSkeleton({ columns }: { columns: number }) {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 p-4">
          {[...Array(columns)].map((_, j) => (
            <Skeleton key={j} className="h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <svg
        className="mx-auto h-12 w-12 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <p className="mt-2 text-muted-foreground">{message}</p>
    </div>
  );
}

export function ResponsiveTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyField,
  onRowClick,
  isLoading,
  emptyMessage = "データがありません",
  mobileCardTitle,
  mobileCardActions,
}: ResponsiveTableProps<T>) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isLoading) {
    return <LoadingSkeleton columns={Math.min(columns.length, 4)} />;
  }

  if (data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  // モバイル: カード形式
  if (isMobile) {
    const sortedColumns = [...columns]
      .filter((col) => !col.hideOnMobile || col.priority)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    return (
      <div className="space-y-3 px-2 sm:px-0">
        {data.map((item) => (
          <Card
            key={String(item[keyField])}
            className={cn(
              "p-0 gap-0 overflow-hidden",
              onRowClick && "cursor-pointer active:bg-muted/50 transition-colors"
            )}
            onClick={() => onRowClick?.(item)}
          >
            {mobileCardTitle && (
              <CardHeader className="px-4 py-3 bg-muted/30 border-b">
                <div className="font-semibold text-foreground">
                  {mobileCardTitle(item)}
                </div>
              </CardHeader>
            )}

            <CardContent className="px-4 py-3 space-y-2">
              {sortedColumns.map((column) => {
                const value = column.render
                  ? column.render(item)
                  : String(item[column.key as keyof T] ?? "-");

                return (
                  <div
                    key={String(column.key)}
                    className="flex justify-between items-start gap-2"
                  >
                    <span className="text-sm text-muted-foreground flex-shrink-0">
                      {column.label}
                    </span>
                    <span className="text-sm text-foreground text-right font-medium">
                      {value}
                    </span>
                  </div>
                );
              })}
            </CardContent>

            {mobileCardActions && (
              <CardFooter className="px-4 py-3 bg-muted/30 border-t">
                <div className="w-full" onClick={(e) => e.stopPropagation()}>
                  {mobileCardActions(item)}
                </div>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    );
  }

  // タブレット・デスクトップ: テーブル形式
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          {columns.map((column) => (
            <TableHead
              key={String(column.key)}
              className={cn(
                "px-4 lg:px-6",
                column.hideOnMobile && "hidden md:table-cell"
              )}
            >
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow
            key={String(item[keyField])}
            className={cn(onRowClick && "cursor-pointer")}
            onClick={() => onRowClick?.(item)}
          >
            {columns.map((column) => (
              <TableCell
                key={String(column.key)}
                className={cn(
                  "px-4 lg:px-6 py-4",
                  column.hideOnMobile && "hidden md:table-cell"
                )}
              >
                {column.render
                  ? column.render(item)
                  : String(item[column.key as keyof T] ?? "-")}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default ResponsiveTable;
