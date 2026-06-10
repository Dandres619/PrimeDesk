import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog';
import { Button } from './button';
import { Smartphone, Download, Globe } from 'lucide-react';

const APK_URL = 'https://drive.google.com/uc?export=download&id=12H14E2LRh-apyub6bL2ndaLXLVyCGsn9';

interface MobileDetectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileDetectDialog({ open, onOpenChange }: MobileDetectDialogProps) {
  const handleDownload = () => {
    window.open(APK_URL, '_blank');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-md animate-modal"
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Smartphone className="w-6 h-6 text-blue-600" />
            <DialogTitle className="text-lg">Dispositivo móvil detectado</DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Se detectó que estás usando un dispositivo móvil
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-muted-foreground">
            Estás accediendo desde un dispositivo móvil. ¿Deseas descargar la aplicación para una mejor experiencia, o prefieres continuar desde el navegador web?
          </p>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 gap-2"
          >
            <Globe className="w-4 h-4" />
            Continuar en la web
          </Button>
          <Button
            onClick={handleDownload}
            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4" />
            Descargar APK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
