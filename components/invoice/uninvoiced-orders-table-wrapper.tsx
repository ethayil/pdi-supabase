"use client";

import { Plus } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { getUninvoicedOrders } from "@/data/invoices";
import { useInvoiceParams } from "@/lib/nuqs/invoice-params";
import { formatCurrency, isUkCountry } from "@/lib/utils";
import { CreateInvoiceDialog } from "./create-invoice-dialog";
import {
  getUninvoicedOrdersColumns,
  type UninvoicedOrder,
} from "./uninvoiced-orders-columns";
import { UninvoicedOrdersToolbar } from "./uninvoiced-orders-toolbar";

interface UninvoicedOrdersTableWrapperProps {
  initialOrders?: UninvoicedOrder[];
}

export function UninvoicedOrdersTableWrapper({
  initialOrders = [],
}: UninvoicedOrdersTableWrapperProps) {
  const [isPending, startTransition] = useTransition();
  const [{ orgId, status, query, start, end }, setParams] = useInvoiceParams({
    startTransition,
  });

  const [orders, setOrders] = useState<UninvoicedOrder[]>(initialOrders);
  const [loading, setLoading] = useState<boolean>(false);

  // Selection & Dialog state
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [targetOrgId, setTargetOrgId] = useState<string>("");
  const [preselectedOrderIds, setPreselectedOrderIds] = useState<string[]>([]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getUninvoicedOrders({
        orgId: orgId === "all" ? undefined : orgId,
        status: status === "all" ? undefined : status,
        search: query || undefined,
      });
      setOrders(data as UninvoicedOrder[]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load uninvoiced orders");
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchOrders relies on orgId, status, and query URL parameters to refetch uninvoiced orders
  useEffect(() => {
    fetchOrders();
  }, [orgId, status, query]);

  const handleClearFilters = () => {
    setParams({
      status: null,
      query: null,
      currentPage: 1,
    });
  };

  const handleCreateInvoiceSingle = (order: UninvoicedOrder) => {
    setTargetOrgId(order.orgId);
    setPreselectedOrderIds([order.id]);
    setCreateDialogOpen(true);
  };

  // Selected orders computation
  const selectedIndices = Object.keys(rowSelection).filter(
    (key) => rowSelection[key],
  );
  const selectedOrders = useMemo(() => {
    return selectedIndices
      .map((idx) => orders[parseInt(idx, 10)])
      .filter(Boolean);
  }, [selectedIndices, orders]);

  const uniqueOrgIds = useMemo(() => {
    return Array.from(new Set(selectedOrders.map((o) => o.orgId)));
  }, [selectedOrders]);

  const singleOrgId = uniqueOrgIds.length === 1 ? uniqueOrgIds[0] : null;

  const handleBatchCreateInvoice = () => {
    if (selectedOrders.length === 0) return;
    if (!singleOrgId) {
      toast.error("All selected orders must belong to the same organization.");
      return;
    }
    setTargetOrgId(singleOrgId);
    setPreselectedOrderIds(selectedOrders.map((o) => o.id));
    setCreateDialogOpen(true);
  };

  const totalSelectedEstPrice = useMemo(() => {
    return selectedOrders.reduce((sum, order) => {
      const isUk = isUkCountry(order.country);
      const cost = order.courierCost || 0;
      const vat = isUk ? order.courierVAT || 0 : 0;
      return sum + cost + vat;
    }, 0);
  }, [selectedOrders]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: columns definition is static and created once with handleCreateInvoiceSingle handler
  const columns = useMemo(
    () =>
      getUninvoicedOrdersColumns({
        onCreateInvoiceForOrder: handleCreateInvoiceSingle,
      }),
    [],
  );

  const totalCount = orders.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / 20));

  return (
    <>
      <DataTable
        columns={columns}
        data={orders}
        loading={loading || isPending}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        headerComponent={
          <UninvoicedOrdersToolbar
            loading={loading || isPending}
            statusFilter={status || "all"}
            onStatusFilterChange={(val) =>
              setParams({
                status: val === "all" ? null : (val as any),
                currentPage: 1,
              })
            }
            searchQuery={query || ""}
            onSearchQueryChange={(val) =>
              setParams({ query: val || null, currentPage: 1 })
            }
            onClearFilters={handleClearFilters}
          />
        }
        paginationComponent={
          <DataTablePagination
            totalPages={totalPages}
            totalCount={totalCount}
            startTransition={startTransition}
          >
            <DatePickerWithRange
              date={{
                from: start ? new Date(parseInt(start, 10)) : undefined,
                to: end ? new Date(parseInt(end, 10)) : undefined,
              }}
              setDate={(range: DateRange | undefined) => {
                setParams({
                  start: range?.from ? range.from.getTime().toString() : null,
                  end: range?.to ? range.to.getTime().toString() : null,
                });
              }}
            />
          </DataTablePagination>
        }
      />

      {/* Floating Batch Actions Bar */}
      <AnimatePresence>
        {selectedOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 text-foreground border shadow-lg rounded-lg px-4 py-2 flex items-center gap-4"
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="bg-primary text-primary-foreground text-xs font-bold rounded-md size-5.5 flex items-center justify-center">
                {selectedOrders.length}
              </span>
              <span>
                Orders Selected ({formatCurrency(totalSelectedEstPrice)})
              </span>
            </div>

            {uniqueOrgIds.length > 1 ? (
              <span className="text-xs text-destructive font-medium">
                Select orders from 1 org only
              </span>
            ) : (
              <Button
                size="sm"
                className="gap-1.5 h-8"
                onClick={handleBatchCreateInvoice}
              >
                <Plus className="size-4" />
                Create Invoice
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Invoice Dialog */}
      {createDialogOpen && (
        <CreateInvoiceDialog
          organizationId={targetOrgId}
          initialSelectedOrders={preselectedOrderIds}
          open={createDialogOpen}
          onOpenChange={(open) => {
            setCreateDialogOpen(open);
            if (!open) {
              setRowSelection({});
              fetchOrders();
            }
          }}
        />
      )}
    </>
  );
}
