import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface DuplicateInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onResolve: (keep: boolean) => void;
  fileName?: string;
}

export function DuplicateInvoiceDialog({ isOpen, onClose, onResolve, fileName }: DuplicateInvoiceDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Duplicate Invoice Detected</AlertDialogTitle>
          <AlertDialogDescription>
            The invoice "<span className="font-semibold">{fileName}</span>" appears to be a duplicate of an already processed file.
            <br /><br />
            Would you like to ignore this duplicate (recommended) or process it anyway?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={() => onResolve(false)}>Ignore Duplicate</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={() => onResolve(true)}>Process Anyway</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
