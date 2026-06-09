import React from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#030806] text-slate-800 dark:text-slate-100 transition-colors duration-300 relative">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-16 px-6 relative overflow-hidden">
        {/* City skyline background */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 scale-102 transition-transform duration-1000"
          style={{ backgroundImage: "url('/login_background.png')" }}
        />
        
        {/* Dark contrast overlay */}
        <div className="absolute inset-0 bg-slate-950/45 dark:bg-black/60 backdrop-blur-[1.5px] z-10" />

        {/* Center card wrapper */}
        <div className="max-w-[440px] w-full bg-white/95 dark:bg-[#030806]/95 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-3xl p-8 relative z-20 shadow-2xl">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  )
}
