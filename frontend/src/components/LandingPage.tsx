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
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'
      }`}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <span className={`font-bold text-xl ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
                RafaMotos
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className={`font-medium transition-colors flex items-center gap-1 ${
                isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-gray-200'
              }`}>
                Inicio
              </a>
              <a href="#services" className={`font-medium transition-colors flex items-center gap-1 ${
                isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-gray-200'
              }`}>
                Servicios
              </a>
              <a href="#about" className={`font-medium transition-colors flex items-center gap-1 ${
                isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-gray-200'
              }`}>
                Nosotros
              </a>
              <a href="#contact" className={`font-medium transition-colors flex items-center gap-1 ${
                isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-gray-200'
              }`}>
                Contacto
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={onLoginClick}
                className={`px-5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  isScrolled 
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
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
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
              <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-xl flex items-center gap-2 justify-center">
                <Calendar className="w-5 h-5" />
                Agendar Cita
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-lg font-semibold text-lg transition-all border-2 border-white/30 flex items-center gap-2 justify-center">
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
      <section id="services" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nuestros Servicios
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ofrecemos soluciones completas y especializadas para tu motocicleta
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Wrench, title: 'Mantenimiento Preventivo', desc: 'Revisión completa para prevenir fallos y alargar la vida útil de tu moto' },
              { icon: Settings, title: 'Reparación de Motores', desc: 'Diagnóstico profesional y reparación especializada de todo tipo de motores' },
              { icon: Gauge, title: 'Sistema de Frenos', desc: 'Mantenimiento y reparación de frenos para máxima seguridad' },
              { icon: Car, title: 'Suspensión y Dirección', desc: 'Ajuste y reparación de sistemas de suspensión y dirección' },
              { icon: Zap, title: 'Sistema Eléctrico', desc: 'Diagnóstico y reparación de problemas eléctricos y electrónicos' },
              { icon: Brush, title: 'Pintura y Estética', desc: 'Servicios de pintura, pulido y detalles estéticos profesionales' }
            ].map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600">{service.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Sobre <span className="text-blue-600">RafaMotos</span>
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Con más de 15 años de experiencia en el sector, somos líderes en mantenimiento 
                y reparación de motocicletas de todas las marcas y cilindradas. Nuestro equipo 
                de mecánicos certificados utiliza la tecnología más avanzada para garantizar 
                el mejor servicio.
              </p>
              
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1 flex items-center justify-center gap-1">
                    <Users className="w-6 h-6" />
                    5000+
                  </div>
                  <div className="text-gray-600">Clientes Satisfechos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1 flex items-center justify-center gap-1">
                    <Award className="w-6 h-6" />
                    15+
                  </div>
                  <div className="text-gray-600">Años de Experiencia</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1 flex items-center justify-center gap-1">
                    <Shield className="w-6 h-6" />
                    100%
                  </div>
                  <div className="text-gray-600">Garantía</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Mecánicos certificados</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Equipo de diagnóstico</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Repuestos originales</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-blue-600 rounded-3xl p-8 relative z-10">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                  <div className="flex justify-center mb-4">
                    <Bike className="w-20 h-20 text-white/90" />
                  </div>
                  <h3 className="text-2xl font-bold text-white text-center mb-2">
                    ¿Por qué elegirnos?
                  </h3>
                  <p className="text-white/90 text-center">
                    Calidad, experiencia y compromiso con tu seguridad
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-100 rounded-full -z-10"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-100 rounded-full -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Contáctanos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Estamos aquí para ayudarte con tu motocicleta
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              {[
                { icon: MapPin, title: 'Dirección', content: ['Av. Principal #123, Ciudad'] },
                { icon: Phone, title: 'Teléfono', content: ['+52 123 456 7890'] },
                { icon: Mail, title: 'Email', content: ['info@rafamotos.com'] },
                { icon: Clock, title: 'Horario', content: ['Lun - Vie: 9:00 - 19:00', 'Sáb: 9:00 - 14:00'] }
              ].map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div key={index} className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-md">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                      {item.content.map((line, i) => (
                        <p key={i} className="text-gray-600">{line}</p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Contact Form */}
            <form className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                Envíanos un mensaje
              </h3>
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Nombre completo"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="email" 
                    placeholder="Correo electrónico"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div className="relative">
                  <PhoneCall className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="tel" 
                    placeholder="Teléfono"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none bg-white">
                  <option value="">Selecciona un servicio</option>
                  <option value="maintenance">Mantenimiento</option>
                  <option value="repair">Reparación</option>
                  <option value="diagnostic">Diagnóstico</option>
                  <option value="other">Otro</option>
                </select>
                <textarea 
                  placeholder="Mensaje"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                ></textarea>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />
                  Enviar Mensaje
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Bike className="w-8 h-8 text-blue-400" />
                <span className="font-bold text-xl">RafaMotos</span>
              </div>
              <p className="text-gray-400 mb-4">
                Tu taller de confianza para el cuidado de tu motocicleta.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="#"
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="#"
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="#"
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href="#"
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Smartphone className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-gray-400">
                {['Inicio', 'Servicios', 'Nosotros', 'Contacto'].map((item, index) => (
                  <li key={index}>
                    <a href={`#${item.toLowerCase()}`} className="hover:text-blue-400 transition-colors flex items-center gap-2">
                      <ChevronRight className="w-4 h-4" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Servicios</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Mantenimiento
                </li>
                <li className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Reparaciones
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Diagnóstico
                </li>
                <li className="flex items-center gap-2">
                  <Brush className="w-4 h-4" />
                  Personalización
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Boletín Informativo</h4>
              <p className="text-gray-400 mb-4">
                Suscríbete para recibir ofertas especiales
              </p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Tu email"
                  className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-r-lg transition-colors">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2026 RafaMotos. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;