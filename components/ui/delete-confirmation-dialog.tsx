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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationDialogProps {
  entityName: string;
  type: "organization" | "user" | "order" | "product" | "category" | "invoice" | "banner";
  onDelete: () => void;
  ban?: boolean;
  name?: string;
}

export function DeleteConfirmationDialog({
  entityName,
  type,
  onDelete,
  ban,
  name,
}: DeleteConfirmationDialogProps) {
  const description = `${type}: ${entityName}`;

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="outline" className="flex-1 capitalize" />}
      >
        {name ?? "Delete"} {type}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action
            {ban
              ? " will ban "
              : " cannot be undone. This will permanently delete "}
            <Badge variant="default" className="capitalize mr-2">
              {description}
            </Badge>
            from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>
            {name ?? "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
