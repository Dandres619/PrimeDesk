"use client"

import React, { createContext, useContext, useState, HTMLAttributes, ReactNode, isValidElement, cloneElement } from 'react'
import { cn } from '@/lib/utils'

// 1. Contexto y Hook
interface SidebarContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  toggle: () => void
  close: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Se inicia ABIERTO, típico para paneles de administración en escritorio.
  const [isOpen, setIsOpen] = useState(true) 
  
  const toggle = () => setIsOpen((prev) => !prev)
  const close = () => setIsOpen(false)

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, toggle, close }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

// 2. Sidebar Principal (Colapsa en desktop, desliza en mobile)
export function Sidebar({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { isOpen, close } = useSidebar()
  
  return (
    <>
      {/* Overlay/Fondo Oscuro para móviles cuando el menú está abierto */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={close}
      />
      
      {/* La barra lateral en sí */}
      <div
        className={cn(
          // Base styles
          "flex flex-col h-full bg-background border-r transition-all duration-300 z-50 overflow-hidden",
          
          // Mobile: Fixed position, slide in/out
          'fixed inset-y-0 left-0 w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          
          // Desktop: Sticky position, collapse width
          'md:sticky md:top-0 md:translate-x-0', // Anula la posición móvil
          isOpen ? 'md:w-64' : 'md:w-20', // Lógica de colapso/expansión
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  )
}

// 3. Componentes estructurales (ajustados para el padding/ancho colapsado)
export function SidebarHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
    const { isOpen } = useSidebar();

    // Corregido: Usamos una envoltura para aplicar el padding
    return (
      <div
        className={cn(
            "flex flex-col shrink-0 py-6 border-b border-border transition-all duration-300", 
            isOpen ? 'px-4' : 'px-2 md:justify-center', 
            className
        )}
        {...props}
      >
        {/* Envolvemos el contenido con una clase que oculte el texto cuando está colapsado */}
        <div className={cn(
            'flex flex-col transition-opacity duration-300',
            !isOpen && 'md:opacity-0 md:h-0 md:overflow-hidden md:pointer-events-none'
        )}>
            {children}
        </div>
      </div>
    )
}

export function SidebarContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    const { isOpen } = useSidebar();
    return (
      <div
        className={cn(
            "flex-1 overflow-y-auto transition-all duration-300", 
            isOpen ? 'px-4' : 'px-2',
            className
        )}
        {...props}
      />
    )
}

export function SidebarFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    const { isOpen } = useSidebar();
    return (
      <div
        className={cn(
            "shrink-0 border-t border-border py-4 transition-all duration-300", 
            isOpen ? 'px-4' : 'px-2',
            className
        )}
        {...props}
      />
    )
}

// 4. Componentes de Navegación
export function SidebarMenu({ className, ...props }: HTMLAttributes<HTMLUListElement>) {
    return (
      <ul
        className={cn("space-y-1", className)}
        {...props}
      />
    )
}

export function SidebarMenuItem({ className, ...props }: HTMLAttributes<HTMLLIElement>) {
    return (
      <li
        className={cn("", className)}
        {...props}
      />
    )
}

// 5. SidebarMenuButton (Oculta etiqueta cuando colapsa)
export function SidebarMenuButton({ 
  className, 
  children,
  onClick,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { close, isOpen } = useSidebar();
  
  return (
    <button
      className={cn(
        "flex w-full items-center rounded-md text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50",
        
        // Estilos dinámicos: padding y justificación
        isOpen ? 'justify-start gap-3 p-3' : 'justify-center p-3 md:w-full',
        className
      )}
      onClick={(e) => {
        if (onClick) onClick(e);
        // Cierra la barra lateral en móvil después de hacer clic (< 768px)
        if (window.innerWidth < 768) { 
          close();
        }
      }}
      {...props}
    >
        {/* Renderizar hijos, ocultando el Label cuando está colapsado en desktop */}
        {React.Children.map(children as ReactNode, (child, index) => {
            // Asume que el Icono es el primer hijo (index 0) y el Label es el segundo (index 1)
            if (index === 0) { // Icono
                return child;
            }
            if (index === 1) { // Label
                return (
                    <span 
                        className={cn(
                            'transition-opacity duration-300',
                            !isOpen && 'md:hidden'
                        )}
                    >
                        {child}
                    </span>
                );
            }
            return child;
        })}
    </button>
  )
}

// 6. SidebarTrigger (Botón de menú: visible en todas las pantallas como toggle)
export function SidebarTrigger({ 
  className, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { toggle } = useSidebar()

  return (
    <button
      onClick={toggle}
      className={cn(
        // Siempre visible para colapsar/expandir en desktop y abrir/cerrar en mobile
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9",
        className
      )}
      {...props}
    />
  )
}