// import * as React from "react";
// import type { Table } from "@tanstack/react-table";
// import { XIcon } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Portal } from "@/components/ui/portal";
// import { Separator } from "@/components/ui/separator";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { DeleteOrdersConfirmation } from "../order/delete-orders-confirmation";
// import { Datum } from "@/typings/orders";
// import OrderSplitter from "../dragndrop/order-splitter";
// import { Kbd } from "../ui/kbd";

// interface TasksTableFloatingBarProps<TData> {
//   table: Table<TData>;
// }

// export function TasksTableFloatingBar<TData>({
//   table,
// }: TasksTableFloatingBarProps<TData>) {
//   const selectedRows = table.getFilteredSelectedRowModel().rows;

//   // const [isPending, startTransition] = React.useTransition();
//   // const [action, setAction] = React.useState<
//   //   "update-status" | "update-priority" | "export" | "delete"
//   // >();

//   const [clearSelection, setClearSelection] = React.useState(false);

//   // Clear selection on Escape key press
//   React.useEffect(() => {
//     function handleKeyDown(event: KeyboardEvent) {
//       if (event.key === "Escape") {
//         table.toggleAllRowsSelected(false);
//       }
//     }

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [table]);

//   React.useEffect(() => {
//     if (clearSelection) {
//       table.toggleAllRowsSelected(false);
//     }
//   }, [clearSelection]);

//   return (
//     <Portal>
//       <div className="fixed inset-x-0 bottom-12 z-50 mx-auto w-fit px-2.5">
//         <div className="w-full overflow-x-auto">
//           <div className="mx-auto flex w-fit items-center gap-2 rounded-md border bg-background/40 backdrop-blur-sm p-2 text-foreground shadow-sm">
//             <div className="flex h-7 items-center rounded-md border border-dashed pr-1 pl-2.5">
//               <span className="whitespace-nowrap text-xs">
//                 {selectedRows.length} selected
//               </span>
//               <Separator orientation="vertical" className="mr-1 ml-2" />
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="size-5 hover:border"
//                     onClick={() => table.toggleAllRowsSelected(false)}
//                   >
//                     <XIcon className="size-3.5 shrink-0" aria-hidden="true" />
//                   </Button>
//                 </TooltipTrigger>
//                 <TooltipContent className="flex w-full">
//                   <p className="mr-2">Clear selection</p>
//                   <Kbd abbrTitle="Escape" variant="outline">
//                     Esc
//                   </Kbd>
//                 </TooltipContent>
//               </Tooltip>
//             </div>
//             <Separator orientation="vertical" className="hidden h-5 sm:block" />
//             <div className="flex items-center gap-1.5">
//               {selectedRows.length === 1 && (
//                 <>
//                   <OrderSplitter
//                     order={
//                       table.getSelectedRowModel().rows[0].original as Datum
//                     }
//                     setClearSelection={setClearSelection}
//                     type="order"
//                   />
//                   <OrderSplitter
//                     order={
//                       table.getSelectedRowModel().rows[0].original as Datum
//                     }
//                     setClearSelection={setClearSelection}
//                     type="package"
//                   />
//                 </>
//               )}

//               {/* <Tooltip>
//                 <TooltipTrigger asChild>
//                   <Button
//                     variant="secondary"
//                     size="icon"
//                     onClick={() => {
//                       setAction("export");

//                       startTransition(() => {
//                         exportTableToCSV(table, {
//                           excludeColumns: ["select", "actions"],
//                           filename: user?.category ?? "Orders",
//                           onlySelected: false,
//                         });
//                       });
//                     }}
//                     disabled={isPending}
//                   >
//                     {isPending && action === "export" ? (
//                       <Loader
//                         className="size-4 animate-spin"
//                         aria-hidden="true"
//                       />
//                     ) : (
//                       <Download className="size-4" aria-hidden="true" />
//                     )}
//                   </Button>
//                 </TooltipTrigger>
//                 <TooltipContent>
//                   <p>Export</p>
//                 </TooltipContent>
//               </Tooltip> */}

//               <DeleteOrdersConfirmation
//                 orders={selectedRows.map((row) => row.original) as Datum[]}
//                 setClearSelection={setClearSelection}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </Portal>
//   );
// }
