"use client";

import { DownloadIcon, FileIcon, UploadIcon } from "lucide-react";
import * as motion from "motion/react-client";
import Papa from "papaparse";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GlowingIcon } from "@/components/ui/glowing-icon";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bulkCreateProducts, bulkUpdateProducts } from "@/data/products";
import { useRegisterAction } from "@/hooks/use-command-actions";
import { cn } from "@/lib/utils";

type RowResult = {
  row: number;
  sku: string;
  success: boolean;
  error?: string;
};

type Phase = "idle" | "parsed" | "processing" | "done";
type Mode = "create" | "update";

const BATCH_SIZE = 20;

const CSV_HEADERS: Record<Mode, string[]> = {
  create: [
    "sku",
    "name",
    "categoryName",
    "weight",
    "quantity",
    "description",
    "imgUrl",
    "isActive",
  ],
  update: [
    "sku",
    "name",
    "categoryName",
    "weight",
    "quantity",
    "description",
    "imgUrl",
    "isActive",
  ],
};

function downloadTemplate(mode: Mode) {
  const csv = CSV_HEADERS[mode].join(",") + "\n";
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    mode === "create" ? "bulk-add-template.csv" : "bulk-update-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function useTabState() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<RowResult[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  function reset() {
    setPhase("idle");
    setParsedRows([]);
    setProgress(0);
    setResults([]);
    setFileName(null);
  }

  return {
    phase,
    setPhase,
    parsedRows,
    setParsedRows,
    progress,
    setProgress,
    results,
    setResults,
    dragOver,
    setDragOver,
    fileName,
    setFileName,
    reset,
  };
}

function BulkTab({
  mode,
  organizationId,
}: {
  mode: Mode;
  organizationId: string;
}) {
  const {
    phase,
    setPhase,
    parsedRows,
    setParsedRows,
    progress,
    setProgress,
    results,
    setResults,
    dragOver,
    setDragOver,
    fileName,
    setFileName,
    reset,
  } = useTabState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function parseFile(file: File) {
    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors.length > 0) {
          toast.error(`CSV parse error: ${result.errors[0].message}`);
          return;
        }
        if (result.data.length === 0) {
          toast.error("CSV file is empty");
          return;
        }
        setParsedRows(result.data);
        setPhase("parsed");
      },
      error: (err) => toast.error(`Failed to parse CSV: ${err.message}`),
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) parseFile(file);
    else toast.error("Please drop a .csv file");
  }

  async function handleProcess() {
    setPhase("processing");
    setProgress(0);
    setResults([]);

    const allResults: RowResult[] = [];
    const total = parsedRows.length;

    for (let i = 0; i < total; i += BATCH_SIZE) {
      const batch = parsedRows.slice(i, i + BATCH_SIZE);

      try {
        let batchResults: RowResult[];
        if (mode === "create") {
          batchResults = await bulkCreateProducts({
            orgId: organizationId,
            rows: batch.map((r) => ({
              sku: r.sku?.trim() ?? "",
              name: r.name?.trim() ?? "",
              categoryName: r.categoryName?.trim() ?? "",
              weight: parseFloat(r.weight) || 0,
              quantity: parseFloat(r.quantity) || 0,
              description: r.description?.trim() || undefined,
              imgUrl: r.imgUrl?.trim() || undefined,
              isActive:
                r.isActive?.trim().toLowerCase() !== "false" &&
                r.isActive?.trim() !== "0",
            })),
          });
        } else {
          batchResults = await bulkUpdateProducts({
            orgId: organizationId,
            rows: batch.map((r) => {
              const keys = Object.keys(r);
              const row: {
                sku: string;
                name?: string;
                categoryName?: string;
                weight?: number;
                quantity?: number;
                description?: string;
                imgUrl?: string;
                isActive?: boolean;
              } = { sku: r.sku?.trim() ?? "" };
              if (keys.includes("name") && r.name?.trim())
                row.name = r.name.trim();
              if (keys.includes("categoryName") && r.categoryName?.trim())
                row.categoryName = r.categoryName.trim();
              if (keys.includes("description"))
                row.description = r.description?.trim() || undefined;
              if (keys.includes("imgUrl"))
                row.imgUrl = r.imgUrl?.trim() || undefined;
              if (keys.includes("weight") && r.weight?.trim())
                row.weight = parseFloat(r.weight) || 0;
              if (keys.includes("quantity") && r.quantity?.trim())
                row.quantity = parseFloat(r.quantity) || 0;
              if (keys.includes("isActive") && r.isActive?.trim()) {
                row.isActive =
                  r.isActive.trim().toLowerCase() !== "false" &&
                  r.isActive.trim() !== "0";
              }
              return row;
            }),
          });
        }
        // Offset row numbers by batch start so they're global (not per-batch)
        const mappedResults = batchResults.map((r) => ({ ...r, row: r.row + i }));
        allResults.push(...mappedResults);
        setResults((prev) => [...prev, ...mappedResults]);
      } catch (err) {
        const errorResults: RowResult[] = [];
        batch.forEach((raw, idx) => {
          errorResults.push({
            row: i + idx + 1,
            sku: raw.sku ?? "",
            success: false,
            error: err instanceof Error ? err.message : "Batch failed",
          });
        });
        allResults.push(...errorResults);
        setResults((prev) => [...prev, ...errorResults]);
      }
      setProgress(Math.round((allResults.length / total) * 100));
    }

    const succeededCount = allResults.filter((r) => r.success).length;
    const failedCount = allResults.filter((r) => !r.success).length;

    if (failedCount > 0) {
      toast.warning(`Upload complete: ${succeededCount} succeeded, ${failedCount} failed.`);
    } else {
      toast.success(`Upload complete: all ${succeededCount} products processed successfully!`);
    }

    setPhase("done");
  }

  const succeeded = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  return (
    <div className="space-y-2">
      {/* Template row */}
      <div className="flex items-center justify-between rounded-lg border border-dashed px-4 py-3 text-sm">
        <span className="text-muted-foreground">
          Download the sample CSV template.
        </span>
        <Button variant="outline" onClick={() => downloadTemplate(mode)}>
          <DownloadIcon />
          Template
        </Button>
      </div>

      {/* Drop zone */}
      {phase === "idle" && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors cursor-pointer",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40 hover:bg-muted/30",
          )}
          onDragOver={(e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadIcon className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">
            Drag &amp; drop a CSV here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supports .csv files only
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) parseFile(f);
            }}
          />
        </motion.div>
      )}

      {/* Parsed preview */}
      {phase === "parsed" && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 rounded-lg border px-4 py-3 bg-muted/50">
            <FileIcon className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium flex-1 truncate">
              {fileName}
            </span>
            <Badge variant="secondary">{parsedRows.length} rows</Badge>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleProcess}>
              Process {parsedRows.length} rows
            </Button>
            <Button variant="outline" onClick={reset}>
              Change File
            </Button>
          </div>
        </motion.div>
      )}

      {/* Processing */}
      {phase === "processing" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="space-y-3 py-2"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Processing…</span>
            <span className="text-muted-foreground tabular-nums">
              {results.length} / {parsedRows.length} ({progress}%)
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
          <p className="text-xs text-muted-foreground text-center">
            Processing in batches of {BATCH_SIZE}. Please wait…
          </p>
        </motion.div>
      )}

      {/* Results */}
      {phase === "done" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="space-y-3"
        >
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05, duration: 0.25 }}
              className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3"
            >
              <GlowingIcon icon="CheckCircle2" size="xs" color="#22c55e" />
              <div>
                <p className="text-sm font-semibold text-emerald-500">
                  {succeeded.length} Succeeded
                </p>
                <p className="text-xs text-muted-foreground">
                  Products processed
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.25 }}
              className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3"
            >
              <GlowingIcon
                icon="XCircle"
                size="xs"
                color={failed.length > 0 ? "#fb2c36" : "#6b7280"}
              />
              <div>
                <p className="text-sm font-semibold text-red-500">
                  {failed.length} Failed
                </p>
                <p className="text-xs text-muted-foreground ">
                  Rows with errors
                </p>
              </div>
            </motion.div>
          </div>

          {/* Error details — constrained height with scroll */}
          {failed.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.25 }}
              className="rounded-lg border overflow-hidden"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Error Details
                </p>
                <Badge variant="outline" className="text-xs">
                  {failed.length} rows
                </Badge>
              </div>
              <ScrollArea className="h-[min(260px,40vh)]">
                <div className="divide-y">
                  {failed.map((r, i) => (
                    <motion.div
                      key={r.row}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.015, duration: 0.2 }}
                      className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/20 transition-colors"
                    >
                      <span className="text-muted-foreground font-mono text-xs mt-0.5 shrink-0 w-12">
                        Row {r.row}
                      </span>
                      <span className="shrink-0 text-foreground min-w-24">
                        {r.sku || "(no SKU)"}
                      </span>
                      <span className="text-destructive flex-1 text-xs leading-relaxed">
                        {r.error}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          )}

          <Button variant="outline" className="w-full" onClick={reset}>
            Upload Another File
          </Button>
        </motion.div>
      )}
    </div>
  );
}

export default function BulkProductUpload({
  organizationId,
}: {
  organizationId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useRegisterAction({
    id: "bulk-upload",
    label: "Bulk Import",
    shortcut: "u",
    handler: () => setIsOpen(true),
    category: "Products",
    icon: UploadIcon,
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <UploadIcon className="size-4" />
        <span className="hidden sm:inline">Bulk </span>Import
      </DialogTrigger>

      <DialogContent className="min-w-full sm:min-w-xl md:min-w-2xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Bulk Product Import</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-sm">
            Add new products or update existing ones via CSV.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Bulk Add</TabsTrigger>
            <TabsTrigger value="update">Bulk Update</TabsTrigger>
          </TabsList>
          <TabsContent value="create">
            <BulkTab mode="create" organizationId={organizationId} />
          </TabsContent>
          <TabsContent value="update">
            <BulkTab mode="update" organizationId={organizationId} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
