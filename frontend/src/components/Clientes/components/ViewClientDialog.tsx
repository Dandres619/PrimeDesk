import { useState, useEffect } from 'react';
import { User, Mail, Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { Label } from '../../ui/label';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
const BASE_URL = API_URL.replace('/api', '');

interface ViewClientDialogProps {
  client: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getPhotoUrl = (photo: string | null) => {
  if (!photo) return undefined;
  if (photo.startsWith('http')) return photo;
  return `${BASE_URL}${photo}`;
};

export function ViewClientDialog({ client, open, onOpenChange }: ViewClientDialogProps) {
  const [imgLoading, setImgLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setImgLoading(true);
    }
  }, [open, client?.Foto]);

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto animate-modal p-0">
        <div className="px-8 pt-8 pb-8 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              {getPhotoUrl(client.Foto) ? (
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl relative">
                  {imgLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900 z-10">
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    </div>
                  )}
                  <img
                    src={getPhotoUrl(client.Foto)!}
                    alt="Perfil"
                    onLoad={() => setImgLoading(false)}
                    onError={() => setImgLoading(false)}
                    className={`w-full h-full object-cover transition-opacity duration-200 ${imgLoading ? "opacity-0" : "opacity-100"}`}
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-800">
                  <span className="text-white text-2xl font-bold">{client.Nombre?.[0]}{client.Apellido?.[0]}</span>
                </div>
              )}
              <Badge className={`absolute -bottom-2 -right-2 border-2 border-white dark:border-slate-800 shadow-sm ${client.ID_Usuario === null || client.EstadoUsuario ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}>
                {client.ID_Usuario === null || client.EstadoUsuario ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <div className="text-center sm:text-left space-y-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {client.Nombre} {client.Apellido}
              </h3>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800">
                  Cliente
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-8 space-y-8">
          {[
            {
              title: 'Información Personal',
              icon: <User className="w-4 h-4" />,
              fields: [
                ['Nombres', `${client.Nombre}`],
                ['Apellidos', `${client.Apellido}`],
                ['Tipo de documento', `${client.TipoDocumento}`],
                ['Documento', `${client.Documento}`],
                ['Fecha de nacimiento', client.FechaNacimiento ? new Date(client.FechaNacimiento).toLocaleDateString('es-ES') : 'No registrada'],
                ['Edad', client.FechaNacimiento ? `${new Date().getFullYear() - new Date(client.FechaNacimiento).getFullYear()} años` : '---']
              ]
            },
            {
              title: 'Contacto y Ubicación',
              icon: <Mail className="w-4 h-4" />,
              fields: [
                ['Correo electrónico', client.Correo || 'Sin cuenta de acceso'],
                ['Teléfono de contacto', client.Telefono],
                ['Dirección de residencia', client.Direccion || 'Sin dirección'],
                ['Barrio', client.Barrio || 'Sin barrio']
              ]
            }
          ].map((section, i) => (
            <div key={i} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="text-blue-600">{section.icon}</div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">{section.title}</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {section.fields.map(([label, value], j) => (
                  <div key={j} className="space-y-1">
                    <Label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{label}</Label>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
