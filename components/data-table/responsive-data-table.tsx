"use client";

import type * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Column {
  key: string;
  label: string;
  className?: string;
  render?: (value: any, row: any) => React.ReactNode;
  mobileRender?: (row: any) => React.ReactNode;
  hideOnMobile?: boolean;
}

interface Action {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (row: any) => void;
  variant?: "default" | "destructive";
}

interface ResponsiveDataTableProps {
  data: any[];
  columns: Column[];
  actions?: Action[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ComponentType<{ className?: string }>;
}

export function ResponsiveDataTable({
  data,
  columns,
  actions,
  loading = false,
  emptyMessage = "No data found",
  emptyIcon: EmptyIcon,
}: ResponsiveDataTableProps) {
  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardContent className="flex-1 p-0 overflow-hidden">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6">
            {EmptyIcon && (
              <EmptyIcon className="h-16 w-16 text-muted-foreground mb-4" />
            )}
            <h3 className="text-lg font-semibold mb-2">No data found</h3>
            <p className="text-muted-foreground text-center">{emptyMessage}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block h-full overflow-hidden">
              <div className="h-full overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-20 border-b shadow-sm">
                    <TableRow index={0} className="hover:bg-transparent">
                      {columns.map((column) => (
                        <TableHead
                          key={column.key}
                          className={`bg-background ${column.className || ""}`}
                        >
                          {column.label}
                        </TableHead>
                      ))}
                      {actions && actions.length > 0 && (
                        <TableHead className="text-right bg-background">
                          Actions
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row, index) => (
                      <TableRow index={index} key={row.id || index}>
                        {columns.map((column) => (
                          <TableCell
                            key={column.key}
                            className={column.className}
                          >
                            {column.render
                              ? column.render(row[column.key], row)
                              : row[column.key]}
                          </TableCell>
                        ))}
                        {actions && actions.length > 0 && (
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {actions.map((action, actionIndex) => (
                                  <DropdownMenuItem
                                    key={actionIndex}
                                    onClick={() => action.onClick(row)}
                                    className={
                                      action.variant === "destructive"
                                        ? "text-destructive"
                                        : ""
                                    }
                                  >
                                    {action.icon && (
                                      <action.icon className="mr-2 h-4 w-4" />
                                    )}
                                    {action.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden h-full overflow-auto">
              <div className="p-3 space-y-3">
                {data.map((row, index) => (
                  <Card key={row.id || index} className="p-3 overflow-hidden">
                    <div className="space-y-3">
                      {columns
                        .filter((column) => !column.hideOnMobile)
                        .map((column) => (
                          <div key={column.key} className="min-w-0">
                            {column.mobileRender ? (
                              <div className="min-w-0 overflow-hidden">
                                {column.mobileRender(row)}
                              </div>
                            ) : (
                              <div className="flex justify-between items-start gap-2 min-w-0">
                                <span className="text-sm font-medium text-muted-foreground flex-shrink-0">
                                  {column.label}:
                                </span>
                                <div className="text-sm font-medium text-right min-w-0 overflow-hidden">
                                  {column.render
                                    ? column.render(row[column.key], row)
                                    : row[column.key]}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      {actions && actions.length > 0 && (
                        <div className="flex justify-end pt-2 border-t">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 text-xs"
                              >
                                <MoreHorizontal className="h-3 w-3 mr-1" />
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {actions.map((action, actionIndex) => (
                                <DropdownMenuItem
                                  key={actionIndex}
                                  onClick={() => action.onClick(row)}
                                  className={
                                    action.variant === "destructive"
                                      ? "text-destructive"
                                      : ""
                                  }
                                >
                                  {action.icon && (
                                    <action.icon className="mr-2 h-4 w-4" />
                                  )}
                                  {action.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
