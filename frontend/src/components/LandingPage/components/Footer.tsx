import { Bike, Instagram, Facebook, Twitter, Smartphone, Send } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white pt-24 pb-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
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
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter, Smartphone].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
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

          <div className="space-y-6">
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-blue-500 mb-8">Newsletter</h4>
            <p className="text-slate-400 text-sm">Recibe tips de mantenimiento y ofertas exclusivas cada mes.</p>
            <form className="relative" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Tu correo aquí..."
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-6 pr-16 focus:border-blue-600 outline-none transition-all text-sm"
              />
              <button className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-xs font-bold uppercase tracking-widest">
          <p>&copy; 2026 Rafa Motos. Todos los derechos reservados.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white">Privacidad</a>
            <a href="#" className="hover:text-white">Términos</a>
            <a href="#" className="hover:text-white">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
