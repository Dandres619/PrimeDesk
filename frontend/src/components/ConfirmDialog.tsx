import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle, Trash2, XCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void | Promise<any>;
  variant?: 'delete' | 'cancel' | 'default';
  loading?: boolean;
  autoClose?: boolean;
  loadingText?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText = 'Cancelar',
  onConfirm,
  variant = 'default',
  loading = false,
  autoClose = true,
  loadingText = 'Procesando...'
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isCurrentlyLoading = loading || internalLoading;

  const getIcon = () => {
    switch (variant) {
      case 'delete':
        return <Trash2 className="w-6 h-6 text-red-600" />;
      case 'cancel':
        return <XCircle className="w-6 h-6 text-orange-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (variant) {
      case 'delete':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'cancel':
        return 'bg-orange-600 hover:bg-orange-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  const handleConfirm = async () => {
    setInternalLoading(true);
    try {
      await onConfirm();
      if (autoClose) {
        onOpenChange(false);
      }
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {getIcon()}
            <DialogTitle className="text-lg">{title}</DialogTitle>
          </div>
          <DialogDescription className="sr-only">{description}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-muted-foreground">{description}</p>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCurrentlyLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isCurrentlyLoading}
            className={`flex-1 ${getConfirmButtonClass()}`}
          >
            {isCurrentlyLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {loadingText}
              </>
            ) : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}