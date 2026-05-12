import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Expertise } from './components/Expertise';
import { Testimonials } from './components/Testimonials';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

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

    // Usar Intersection Observer para una detección más confiable
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Dejar de observar una vez visible
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-section');
    revealElements.forEach(el => observer.observe(el));

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden landing-container">
      <Navbar 
        isScrolled={isScrolled} 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
        onLoginClick={onLoginClick} 
        onRegisterClick={onRegisterClick} 
      />
      
      <main>
        <Hero onRegisterClick={onRegisterClick} />
        
        <section className="reveal-section">
          <Services onRegisterClick={onRegisterClick} />
        </section>
        
        <section className="reveal-section">
          <Expertise onRegisterClick={onRegisterClick} />
        </section>
        
        <section className="reveal-section">
          <Testimonials />
        </section>
        
        <section className="reveal-section">
          <Contact />
        </section>
      </main>
      
      <Footer />

      <style>{`
        html {
          scroll-behavior: smooth !important;
        }

        .landing-container {
          scroll-behavior: smooth;
        }

        .reveal-section {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: opacity, transform;
        }

        .reveal-section.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Fallback para evitar que se quede en blanco si JS tarda */
        @media (prefers-reduced-motion: reduce) {
          .reveal-section {
            opacity: 1;
            transform: none;
          }
        }

        .reveal-item {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .is-visible .reveal-item {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
