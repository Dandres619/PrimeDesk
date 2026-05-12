import { Calendar, Wrench, ChevronDown } from 'lucide-react';
import heroBg from '@/assets/landing/hero-bg.jpg';

interface HeroProps {
  onRegisterClick: () => void;
}

export function Hero({ onRegisterClick }: HeroProps) {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0f172a]">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/85 via-slate-950/80 to-[#0f172a] z-10"></div>
        <img
          src={heroBg}
          alt="Motorcycle workshop"
          className="w-full h-full object-cover scale-105 animate-soft-zoom opacity-50 mix-blend-overlay"
        />
      </div>

      <div className="relative z-20 container mx-auto px-4 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
            Taller Especializado en{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-500 to-purple-500">Motocicletas</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto drop-shadow-lg font-medium opacity-90">
            Servicio profesional, diagnóstico preciso y repuestos originales para tu moto
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onRegisterClick}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center gap-2 justify-center"
            >
              <Calendar className="w-5 h-5" />
              Agendar Servicio
            </button>
            <button
              onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white/5 backdrop-blur-md hover:bg-white/10 text-white rounded-xl font-bold text-lg transition-all border border-white/20 flex items-center gap-2 justify-center hover:border-white/40"
            >
              <Wrench className="w-5 h-5" />
              Conocer Servicios
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <ChevronDown className="w-4 h-4 text-white/80 mt-2" />
        </div>
      </div>
      <style>{`
        @keyframes soft-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-soft-zoom {
          animation: soft-zoom 20s infinite alternate ease-in-out;
        }
      `}</style>
    </section>
  );
}
