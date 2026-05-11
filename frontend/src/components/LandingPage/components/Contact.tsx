import { MapPin, Clock, Phone, Instagram, Facebook, Bike } from 'lucide-react';
import contactImg from '@/assets/landing/contact-img.jpg';

export function Contact() {
  return (
    <section id="contacto" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch gap-0 rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100">
            {/* Info Panel */}
            <div className="bg-white p-12 md:p-16 flex flex-col justify-center">
              <h2 className="text-4xl font-black text-slate-900 mb-4">¿Dónde está <span className="text-blue-600">tu próxima</span> aventura?</h2>
              <p className="text-slate-600 mb-12">Pasa por nuestro taller para un diagnóstico rápido o simplemente a saludar. El café va por nuestra cuenta.</p>

              <div className="space-y-8">
                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-indigo-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-1">Ubicación</h4>
                    <p className="text-lg text-slate-600 font-medium">Carrera 54 #96a-17, Aranjuez</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-indigo-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-1">Horario de Operación</h4>
                    <p className="text-lg text-slate-600 font-medium">Lunes - Viernes: 8:30 AM - 6:30 PM</p>
                    <p className="text-sm text-slate-400">Sábados, Domingos y festivos: Cerrado</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-indigo-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-1">Línea de Atención</h4>
                    <p className="text-2xl text-blue-600 font-black">+57 313 661 95 08</p>
                    <p className="text-sm text-slate-400">WhatsApp activo para agendamientos</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-12 border-t border-slate-100 flex gap-6">
                <a href="#" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors font-bold text-sm uppercase tracking-widest">
                  <Instagram className="w-5 h-5" /> Instagram
                </a>
                <a href="#" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors font-bold text-sm uppercase tracking-widest">
                  <Facebook className="w-5 h-5" /> Facebook
                </a>
              </div>
            </div>

            {/* Visual Panel */}
            <div className="relative min-h-[400px] bg-slate-100">
              <img
                src={contactImg}
                className="absolute inset-0 w-full h-full object-cover"
                alt="Ubicación"
              />
              <div className="absolute inset-0 bg-blue-600/10 mix-blend-multiply"></div>
              <div className="absolute inset-0 flex items-center justify-center p-12">
                <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl text-center max-w-sm border border-white/50">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200">
                    <Bike className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 italic">¿Vienes en camino?</h3>
                  <p className="text-slate-600 mb-8 font-medium">Dale clic para abrir en Google Maps y llegar sin dar vueltas.</p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Carrera+54+%2396a-17+Aranjuez+Colombia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-xl"
                  >
                    <MapPin className="w-5 h-5 text-blue-500" /> Abrir Mapas
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
