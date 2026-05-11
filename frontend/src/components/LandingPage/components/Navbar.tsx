import { Menu, X, LogIn, UserPlus } from 'lucide-react';

interface NavbarProps {
  isScrolled: boolean;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export function Navbar({ isScrolled, isMenuOpen, setIsMenuOpen, onLoginClick, onRegisterClick }: NavbarProps) {
  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className={`font-bold text-xl ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
              RafaMotos
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#inicio" className={`font-medium transition-colors flex items-center gap-1 ${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-gray-200'}`}>
              Inicio
            </a>
            <a href="#servicios" className={`font-medium transition-colors flex items-center gap-1 ${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-gray-200'}`}>
              Servicios
            </a>
            <a href="#nosotros" className={`font-medium transition-colors flex items-center gap-1 ${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-gray-200'}`}>
              Nosotros
            </a>
            <a href="#contacto" className={`font-medium transition-colors flex items-center gap-1 ${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-gray-200'}`}>
              Contacto
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={onLoginClick}
              className={`px-5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${isScrolled ? 'text-gray-700 hover:text-blue-600 hover:bg-gray-100' : 'text-white hover:text-gray-200 hover:bg-white/10'}`}
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
              <a href="#inicio" className="text-gray-700 hover:text-blue-600 font-medium py-2">Inicio</a>
              <a href="#servicios" className="text-gray-700 hover:text-blue-600 font-medium py-2">Servicios</a>
              <a href="#nosotros" className="text-gray-700 hover:text-blue-600 font-medium py-2">Nosotros</a>
              <a href="#contacto" className="text-gray-700 hover:text-blue-600 font-medium py-2">Contacto</a>
              <div className="pt-4 border-t border-gray-200 flex flex-col space-y-3">
                <button onClick={onLoginClick} className="px-5 py-2 text-gray-700 hover:text-blue-600 font-medium flex items-center gap-2 justify-center">
                  <LogIn className="w-4 h-4" /> Iniciar Sesión
                </button>
                <button onClick={onRegisterClick} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-lg flex items-center gap-2 justify-center">
                  <UserPlus className="w-4 h-4" /> Registrarse
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
