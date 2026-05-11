import { Calendar, Wrench, ChevronDown } from 'lucide-react';
import heroBg from '@/assets/landing/hero-bg.jpg';

interface HeroProps {
  onRegisterClick: () => void;
}

export function Hero({ onRegisterClick }: HeroProps) {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60 z-10"></div>
        <img
          src={heroBg}
          alt="Motorcycle workshop"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-20 container mx-auto px-4 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Taller Especializado en{' '}
            <span className="text-blue-400">Motocicletas</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto">
            Servicio profesional, diagnóstico preciso y repuestos originales para tu moto
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onRegisterClick}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-xl flex items-center gap-2 justify-center"
            >
              <Calendar className="w-5 h-5" />
              Agendar Servicio
            </button>
            <button
              onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-lg font-semibold text-lg transition-all border-2 border-white/30 flex items-center gap-2 justify-center"
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
    </section>
  );
}
