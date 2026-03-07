// LandingPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Bike,
  Wrench,
  Settings,
  Gauge,
  Car,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Smartphone,
  Menu,
  X,
  ChevronDown,
  Shield,
  Zap,
  Brush,
  Users,
  Calendar,
  MessageCircle,
  Send,
  ChevronRight,
  Award,
  CheckCircle,
  Mail as MailIcon,
  PhoneCall,
  User,
  LogIn,
  UserPlus,
  ArrowRight,
  Bell,
  Briefcase,
  Truck,
  ShoppingCart,
  DollarSign,
  Package,
  Tag,
  ClipboardList,
  AlertCircle
} from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onRegisterClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'
        }`}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <span className={`font-bold text-xl ${isScrolled ? 'text-gray-900' : 'text-white'
                }`}>
                RafaMotos
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#inicio" className={`font-medium transition-colors flex items-center gap-1 ${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-gray-200'
                }`}>
                Inicio
              </a>
              <a href="#servicios" className={`font-medium transition-colors flex items-center gap-1 ${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-gray-200'
                }`}>
                Servicios
              </a>
              <a href="#nosotros" className={`font-medium transition-colors flex items-center gap-1 ${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-gray-200'
                }`}>
                Nosotros
              </a>
              <a href="#contacto" className={`font-medium transition-colors flex items-center gap-1 ${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-gray-200'
                }`}>
                Contacto
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={onLoginClick}
                className={`px-5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${isScrolled
                  ? 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                  : 'text-white hover:text-gray-200 hover:bg-white/10'
                  }`}
              >
                <LogIn className="w-4 h-4" />
                Iniciar Sesión
              </button>
              <button
                onClick={onRegisterClick}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Registrarse
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-2xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className={isScrolled ? 'text-gray-900' : 'text-white'} />
              ) : (
                <Menu className={isScrolled ? 'text-gray-900' : 'text-white'} />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg py-6 px-4">
              <div className="flex flex-col space-y-4">
                <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium py-2 flex items-center gap-2">
                  Inicio
                </a>
                <a href="#services" className="text-gray-700 hover:text-blue-600 font-medium py-2 flex items-center gap-2">
                  Servicios
                </a>
                <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium py-2 flex items-center gap-2">
                  Nosotros
                </a>
                <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium py-2 flex items-center gap-2">
                  Contacto
                </a>
                <div className="pt-4 border-t border-gray-200 flex flex-col space-y-3">
                  <button
                    onClick={onLoginClick}
                    className="px-5 py-2 text-gray-700 hover:text-blue-600 font-medium flex items-center gap-2 justify-center"
                  >
                    <LogIn className="w-4 h-4" />
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={onRegisterClick}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2 justify-center"
                  >
                    <UserPlus className="w-4 h-4" />
                    Registrarse
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60 z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1742294740060-1b169f3c0807?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Motorcycle workshop"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Hero Content */}
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

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <ChevronDown className="w-4 h-4 text-white/80 mt-2" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-3 block">Expertos en Mecánica</span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                Servicios de <span className="text-blue-600">Alto Rendimiento</span>
              </h2>
              <p className="text-lg text-slate-600">
                Utilizamos tecnología de punta y procesos estandarizados para asegurar que tu motocicleta siempre rinda al máximo.
              </p>
            </div>
            <button
              onClick={onRegisterClick}
              className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm"
            >
              Ver Catálogo Completo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Wrench,
                title: 'Mantenimiento Full',
                desc: 'Servicio sincronizado que incluye limpieza de inyectores, ajuste de válvulas y revisión de 32 puntos de seguridad.',
                tag: 'Popular'
              },
              {
                icon: Settings,
                title: 'Reparación Especializada',
                desc: 'Intervenciones técnicas en motor, caja de cambios y transmisiones con repuestos genuinos certificados.',
                tag: 'Técnico'
              },
              {
                icon: Gauge,
                title: 'Diagnóstico Electrónico',
                desc: 'Scanner de última generación para todas las marcas, detectando fallos invisibles en el sistema EFI y ABS.',
                tag: 'Precisión'
              },
              {
                icon: Shield,
                title: 'Seguridad y Frenos',
                desc: 'Mantenimiento de sistemas hidráulicos, cambio de pastillas y purgado de sistemas de frenado de alto desempeño.',
                tag: 'Vital'
              },
              {
                icon: Zap,
                title: 'Sistema Eléctrico',
                desc: 'Reparación de ramales, sistemas de carga y encendido electrónico. Instalación de accesorios premium.',
                tag: 'Experto'
              },
              {
                icon: Bike,
                title: 'Puesta a Punto',
                desc: 'Ajuste de suspensiones y ergonomía según el peso y estilo de conducción del piloto para mayor confort.',
                tag: 'Lujo'
              }
            ].map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={index}
                  className="group bg-white rounded-3xl p-8 border border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 relative overflow-hidden"
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 -z-0"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                        {service.tag}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{service.title}</h3>
                    <p className="text-slate-600 leading-relaxed mb-6 text-sm">
                      {service.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section id="nosotros" className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1604260324056-45f7c778754a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Mecánico trabajando"
                  className="w-full h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent"></div>
              </div>

              {/* Floating Stat Card */}
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
                    <CheckCircle className="w-4 h-4 text-blue-600" /> Repuestos Originales
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <CheckCircle className="w-4 h-4 text-blue-600" /> Técnicos Certificados
                  </div>
                </div>
              </div>

              {/* Decorative background element */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl -z-10"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-blue-100 rounded-full -z-10 opacity-50"></div>
            </div>

            <div className="space-y-8">
              <div>
                <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-3 block">Nuestra Trayectoria</span>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                  Más que un taller, somos el <span className="text-blue-600">soporte vital</span> de tu pasión
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  En <strong>Rafa Motos</strong>, entendemos que tu motocicleta es más que un medio de transporte; es una extensión de tu libertad. Por eso, hemos perfeccionado el arte de la mecánica durante más de 15 años.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <div className="text-4xl font-black text-blue-600">15+</div>
                  <div className="text-sm font-bold text-slate-900 uppercase tracking-widest">Años de Experticia</div>
                  <p className="text-xs text-slate-500">Liderando el mercado local con honestidad y precisión.</p>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-black text-blue-600">8k+</div>
                  <div className="text-sm font-bold text-slate-900 uppercase tracking-widest">Motos Atendidas</div>
                  <p className="text-xs text-slate-500">Desde scooters urbanas hasta superbikes de alta cilindrada.</p>
                </div>
              </div>

              <div className="pt-6">
                <blockquote className="border-l-4 border-blue-600 pl-6 py-2 italic text-slate-700 text-lg">
                  "Nuestro objetivo no es solo arreglar motos, es garantizar que cada cliente sienta la misma confianza que nosotros al salir a la ruta."
                  <footer className="mt-4 not-italic font-bold text-slate-900">— Rafael S., Fundador</footer>
                </blockquote>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={onRegisterClick}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Agendar Servicio
                </button>
                <div className="flex items-center gap-3 px-6">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="User" />
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

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Lo que dicen los Pilotos</h2>
            <p className="text-slate-400">La confianza de nuestra comunidad es nuestro mejor repuesto.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Carlos Mendoza",
                moto: "Kawasaki Z900",
                txt: "El único taller donde me explican con escáner en mano qué tiene mi moto. Transparencia total."
              },
              {
                name: "Juliana Ríos",
                moto: "Yamaha MT-03",
                txt: "Llevo 3 años haciendo el mantenimiento aquí. Mi moto se siente como nueva cada vez que sale."
              },
              {
                name: "Andrés Rojas",
                moto: "BMW R1250 GS",
                txt: "Especialistas reales en alta cilindrada. El servicio de sincronización es impecable."
              }
            ].map((t, i) => (
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

      {/* Contact Section - Redesigned as a Visit Us section */}
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
                  src="https://images.unsplash.com/photo-1586449480537-3a22cf98b04c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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

      {/* Footer */}
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
              <form className="relative">
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
    </div>
  );
};

export default LandingPage;