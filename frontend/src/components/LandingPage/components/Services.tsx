import { Wrench, Settings, Gauge, Shield, Zap, Bike } from 'lucide-react';

interface ServicesProps {
  onRegisterClick: () => void;
}

export function Services({ onRegisterClick }: ServicesProps) {
  const servicesList = [
    { icon: Wrench, title: 'Mantenimiento Full', desc: 'Servicio sincronizado que incluye limpieza de inyectores, ajuste de válvulas y revisión de 32 puntos de seguridad.', tag: 'Popular' },
    { icon: Settings, title: 'Reparación Especializada', desc: 'Intervenciones técnicas en motor, caja de cambios y transmisiones con repuestos genuinos certificados.', tag: 'Técnico' },
    { icon: Gauge, title: 'Diagnóstico Electrónico', desc: 'Scanner de última generación para todas las marcas, detectando fallos invisibles en el sistema EFI y ABS.', tag: 'Precisión' },
    { icon: Shield, title: 'Seguridad y Frenos', desc: 'Mantenimiento de sistemas hidráulicos, cambio de pastillas y purgado de sistemas de frenado de alto desempeño.', tag: 'Vital' },
    { icon: Zap, title: 'Sistema Eléctrico', desc: 'Reparación de ramales, sistemas de carga y encendido electrónico. Instalación de accesorios premium.', tag: 'Experto' },
    { icon: Bike, title: 'Puesta a Punto', desc: 'Ajuste de suspensiones y ergonomía según el peso y estilo de conducción del piloto para mayor confort.', tag: 'Lujo' }
  ];

  return (
    <section id="servicios" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-3 block">Expertos en Mecánica</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              Servicios de <span className="text-indigo-600">Alto Rendimiento</span>
            </h2>
            <p className="text-lg text-slate-600">
              Utilizamos tecnología de punta y procesos estandarizados para asegurar que tu motocicleta siempre rinda al máximo.
            </p>
          </div>
          <button
            onClick={onRegisterClick}
            className="px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
          >
            Ver Catálogo Completo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesList.map((service, index) => (
            <div
              key={index}
              className="group bg-white rounded-3xl p-8 border border-slate-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 relative overflow-hidden reveal-item"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 -z-0"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                    {service.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{service.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-6 text-sm">
                  {service.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
