"use client";

import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function LogDetailsDialog({
  changes,
  description,
}: {
  changes?: any;
  description: string;
}) {
  if (!changes) return null;

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" size="icon" />}>
        <Eye />
      </DialogTrigger>
      <DialogContent className="min-w-full sm:min-w-xl lg:min-w-2xl">
        <DialogHeader>
          <DialogTitle>Activity Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Description</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Changes</h4>
            <ScrollArea className="h-75 w-full rounded-md border p-4 bg-muted/50">
              <pre className="text-xs font-mono">
                {JSON.stringify(changes, null, 2)}
              </pre>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
