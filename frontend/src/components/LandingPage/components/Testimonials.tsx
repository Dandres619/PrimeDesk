import { Sparkles } from 'lucide-react';

export function Testimonials() {
  const testimonialsList = [
    { name: "Carlos Mendoza", moto: "Kawasaki Z900", txt: "El único taller donde me explican con escáner en mano qué tiene mi moto. Transparencia total." },
    { name: "Juliana Ríos", moto: "Yamaha MT-03", txt: "Llevo 3 años haciendo el mantenimiento aquí. Mi moto se siente como nueva cada vez que sale." },
    { name: "Andrés Rojas", moto: "BMW R1250 GS", txt: "Especialistas reales en alta cilindrada. El servicio de sincronización es impecable." }
  ];

  return (
    <section className="py-24 bg-slate-900 text-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Lo que dicen los Pilotos</h2>
          <p className="text-slate-400">La confianza de nuestra comunidad es nuestro mejor repuesto.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonialsList.map((t, i) => (
            <div key={i} className="bg-slate-800/50 p-8 rounded-[2rem] border border-slate-700 hover:bg-slate-800 transition-colors">
              <div className="flex items-center gap-1 text-yellow-500 mb-6">
                {[1, 2, 3, 4, 5].map(s => <Sparkles key={s} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-slate-300 mb-8 italic">"{t.txt}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center font-bold text-blue-400">
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-bold">{t.name}</div>
                  <div className="text-xs text-blue-400">{t.moto}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
