"use client";
import { Check, Edit2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GlowingIcon } from "@/components/ui/glowing-icon";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { OrderWithFullDetails } from "@/data/orders";
import { updateOrder } from "@/data/orders";

interface OrderNotesSectionProps {
  order: OrderWithFullDetails;
  orgId: string;
  isAdmin?: boolean;
}

export function OrderNotesSection({
  order,
  orgId,
  isAdmin,
}: OrderNotesSectionProps) {
  const router = useRouter();
  const [notes, setNotes] = useState(order?.comments || "");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingExternal, setIsEditingExternal] = useState(false);
  const [externalComments, setExternalComments] = useState(
    order?.externalComments || "",
  );

  const isOrderLocked =
    order.status === "cancelled" || order.status === "returned";

  const handleNotesSave = async () => {
    if (!isAdmin) return;
    try {
      await updateOrder({ id: order.id, orgId, comments: notes });
      setIsEditingNotes(false);
      toast.success("Notes updated");
      router.refresh();
    } catch {
      toast.error("Failed to update notes");
    }
  };

  const handleExternalSave = async () => {
    if (!isAdmin) return;
    try {
      await updateOrder({ id: order.id, orgId, externalComments });
      setIsEditingExternal(false);
      toast.success("External comments updated");
      router.refresh();
    } catch {
      toast.error("Failed to update external comments");
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-2">
        {isAdmin && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GlowingIcon icon="ClipboardList" size="sm" color="#ff22e2ff" />
                <span className="text-sm font-semibold">Internal Notes</span>
              </div>
              {isAdmin && !isOrderLocked && (
                <AnimatePresence mode="wait">
                  {!isEditingNotes ? (
                    <motion.div
                      key="edit-btn"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        onClick={() => setIsEditingNotes(true)}
                      >
                        <Edit2 className="size-3" />
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="save-btns"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex gap-1"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive"
                        onClick={() => {
                          setIsEditingNotes(false);
                          setNotes(order.comments || "");
                        }}
                      >
                        <X className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-primary"
                        onClick={handleNotesSave}
                      >
                        <Check className="size-3" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
            <Separator />
            <AnimatePresence mode="wait">
              {isEditingNotes ? (
                <motion.div
                  key="editing-internal"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        handleNotesSave();
                      }
                    }}
                    placeholder="Add internal notes for this order... (Ctrl+Enter to save)"
                    className="text-xs min-h-[100px] bg-muted/50"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="display-internal"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <p className="text-xs text-muted-foreground italic leading-relaxed whitespace-pre-wrap">
                    {order.comments || "No internal notes."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <Separator />
          </>
        )}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <GlowingIcon icon="ListCheck" size="sm" color="#8b5cf6" />
            <span className="text-sm font-semibold">External Notes</span>
          </div>
          {isAdmin && !isOrderLocked && (
            <AnimatePresence mode="wait">
              {!isEditingExternal ? (
                <motion.div
                  key="edit-btn"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    onClick={() => setIsEditingExternal(true)}
                  >
                    <Edit2 className="size-3" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="save-btns"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex gap-1"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive"
                    onClick={() => {
                      setIsEditingExternal(false);
                      setExternalComments(order.externalComments || "");
                    }}
                  >
                    <X className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-primary"
                    onClick={handleExternalSave}
                  >
                    <Check className="size-3" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
        <Separator />
        <AnimatePresence mode="wait">
          {isEditingExternal ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Textarea
                value={externalComments}
                onChange={(e) => setExternalComments(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleExternalSave();
                  }
                }}
                placeholder="Add external notes (shown on labels)... (Ctrl+Enter to save)"
                className="text-xs min-h-[100px] bg-muted/50 whitespace-pre-wrap"
              />
            </motion.div>
          ) : (
            <motion.div
              key="display"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <p className="text-xs text-muted-foreground italic leading-relaxed whitespace-pre-wrap">
                {order.externalComments || "No external notes."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
