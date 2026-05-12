import { Shield, CheckCircle } from 'lucide-react';
import expertiseImg from '@/assets/landing/expertise-img.jpg';
import user1 from '@/assets/landing/user-1.jpg';
import user2 from '@/assets/landing/user-2.jpg';
import user3 from '@/assets/landing/user-3.jpg';

interface ExpertiseProps {
  onRegisterClick: () => void;
}

export function Expertise({ onRegisterClick }: ExpertiseProps) {
  const users = [user1, user2, user3];

  return (
    <section id="nosotros" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <img
                src={expertiseImg}
                alt="Mecánico trabajando"
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 to-transparent"></div>
            </div>

            <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-3xl shadow-2xl z-20 border border-slate-100 hidden md:block">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">Garantía Real</div>
                  <div className="text-sm text-slate-500">En todos nuestros trabajos</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CheckCircle className="w-4 h-4 text-indigo-600" /> Repuestos Originales
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CheckCircle className="w-4 h-4 text-indigo-600" /> Técnicos Certificados
                </div>
              </div>
            </div>

            <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-600/5 rounded-full blur-3xl -z-10"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-indigo-100 rounded-full -z-10 opacity-50"></div>
          </div>

          <div className="space-y-8">
            <div>
              <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-3 block">Nuestra Trayectoria</span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                Más que un taller, somos el <span className="text-indigo-600">soporte vital</span> de tu pasión
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                En <strong>Rafa Motos</strong>, entendemos que tu motocicleta es más que un medio de transporte; es una extensión de tu libertad. Por eso, hemos perfeccionado el arte de la mecánica durante más de 15 años.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="text-4xl font-black text-indigo-600">15+</div>
                <div className="text-sm font-bold text-slate-900 uppercase tracking-widest">Años de Experticia</div>
                <p className="text-xs text-slate-500">Liderando el mercado local con honestidad y precisión.</p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-black text-indigo-600">8k+</div>
                <div className="text-sm font-bold text-slate-900 uppercase tracking-widest">Motos Atendidas</div>
                <p className="text-xs text-slate-500">Desde scooters urbanas hasta superbikes de alta cilindrada.</p>
              </div>
            </div>

            <div className="pt-6">
              <blockquote className="border-l-4 border-indigo-600 pl-6 py-2 italic text-slate-700 text-lg">
                "Nuestro objetivo no es solo arreglar motos, es garantizar que cada cliente sienta la misma confianza que nosotros al salir a la ruta."
                <footer className="mt-4 not-italic font-bold text-slate-900">— Rafael S., Fundador</footer>
              </blockquote>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onRegisterClick}
                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
              >
                Agendar Servicio
              </button>
              <div className="flex items-center gap-3 px-6">
                <div className="flex -space-x-3">
                  {users.map((u, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                      <img src={u} alt="User" />
                    </div>
                  ))}
                </div>
                <div className="text-xs font-bold text-slate-500">
                  +200 reviews <br />
                  <span className="text-yellow-500 flex items-center gap-0.5">★★★★★</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
