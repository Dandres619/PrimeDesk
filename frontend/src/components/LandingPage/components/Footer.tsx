import { Bike } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white pt-24 pb-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 mb-20">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Bike className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tighter uppercase italic">Rafa<span className="text-blue-600">Motos</span></span>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm">
              Pasión por la mecánica, compromiso con tu seguridad. Llevamos el servicio técnico a otro nivel con tecnología y honestidad.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-blue-500 mb-8">Navegación</h4>
            <ul className="space-y-4">
              {['Inicio', 'Servicios', 'Nosotros', 'Contacto'].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-blue-500 mb-8">Experticia</h4>
            <ul className="space-y-4 text-slate-400 text-sm font-medium">
              <li>Alta Cilindrada</li>
              <li>Motores EFI</li>
              <li>Inyección Electrónica</li>
              <li>Sincronización</li>
              <li>Diagnosis OBD2</li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-xs font-bold uppercase tracking-widest">
          <p>&copy; 2026 Rafa Motos. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
