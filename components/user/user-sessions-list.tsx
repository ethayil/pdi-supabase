"use client";

import { formatDistanceToNow } from "date-fns";
import { Loader2, Monitor, Smartphone, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";

type SessionType = NonNullable<
  Awaited<ReturnType<typeof authClient.admin.listUserSessions>>["data"]
>["sessions"][number];

export function UserSessionsList({ userId }: { userId: string }) {
  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await authClient.admin.listUserSessions({
      userId,
    });
    if (error) {
      toast.error(error.message || "Failed to load active sessions.");
    } else {
      setSessions(data?.sessions ?? []);
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevoke = async (sessionId: string, sessionToken: string) => {
    setRevokingId(sessionId);
    try {
      const { error } = await authClient.admin.revokeUserSession({
        sessionToken,
      });
      if (error) {
        toast.error(error.message || "Failed to revoke session.");
        return;
      }
      toast.success("Session revoked");
      await fetchSessions();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAll = async () => {
    setRevokingId("all");
    try {
      const { error } = await authClient.admin.revokeUserSessions({ userId });
      if (error) {
        toast.error(error.message || "Failed to revoke all sessions.");
        return;
      }
      toast.success("All sessions revoked");
      await fetchSessions();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
    } finally {
      setRevokingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Active Sessions</h3>
        {sessions.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={!!revokingId}
                />
              }
            >
              Revoke All
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Revoke all sessions?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will sign the user out of all devices. They will need to
                  log in again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRevokeAll}>
                  Revoke All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground border rounded-md border-dashed">
          No active sessions found.
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <div className="max-h-[420px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow index={-1}>
                  <TableHead>Device</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session, index) => {
                  const isMobile = session.userAgent
                    ?.toLowerCase()
                    .includes("mobile");
                  return (
                    <TableRow key={session.id} index={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isMobile ? (
                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Monitor className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span
                            className="max-w-[200px] truncate"
                            title={session.userAgent || "Unknown"}
                          >
                            {session.userAgent || "Unknown Device"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{session.ipAddress || "Unknown"}</TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(session.expiresAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleRevoke(session.id, session.token)
                          }
                          disabled={!!revokingId}
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        >
                          {revokingId === session.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
