
import React from 'react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <main className="bg-slate-950 text-white font-sans">
      <header className="bg-slate-900 shadow-md py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold text-teal-400">StockSentry</h1>
          <nav className="space-x-6">
            <a href="#features" className="text-slate-300 hover:text-white transition">Features</a>
            <a href="#preview" className="text-slate-300 hover:text-white transition">Preview</a>
            <a href="#contact" className="text-slate-300 hover:text-white transition">Contact</a>
          </nav>
        </div>
      </header>

      <section className="text-center py-28 bg-gradient-to-br from-slate-800 to-slate-900">
        <h2 className="text-5xl font-extrabold mb-4">Simplify Your Inventory</h2>
        <p className="text-xl text-slate-400 mb-8">Free. Secure. Intuitive. Built for teams & individuals.</p>
        <div className="flex justify-center gap-6">
          <a href="#" className="bg-teal-500 px-6 py-3 rounded-full font-semibold text-white hover:bg-teal-600 transition">Start Now</a>
          <a href="#" className="underline text-teal-300">Source Code</a>
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <h3 className="text-4xl text-center font-semibold text-teal-300 mb-12">What You Get</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            ["🔐", "Role-based Access"],
            ["📊", "Live Dashboard"],
            ["📁", "Smart Categorization"],
            ["🧾", "Upload Receipts"],
            ["📱", "Device Friendly"],
            ["🚀", "Instant Setup"]
          ].map(([icon, text]) => (
            <div key={text} className="bg-slate-800 rounded-xl p-6 shadow hover:shadow-xl transition">
              <div className="text-3xl mb-2">{icon}</div>
              <div className="text-lg font-medium">{text}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="preview" className="bg-slate-900 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-4xl font-semibold text-teal-300 mb-12">Live Preview</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <Image src="/images/mockup-desktop.png" alt="Desktop Preview" width={800} height={500} className="rounded-xl shadow-lg" />
            <Image src="/images/mockup-mobile.png" alt="Mobile Preview" width={400} height={800} className="rounded-xl shadow-lg" />
          </div>
        </div>
      </section>

      <section id="contact" className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h3 className="text-3xl font-semibold text-teal-300 mb-4">Need Customization?</h3>
        <p className="text-slate-400 mb-6">StockSentry is free for personal and internal business use. For support, commercial licensing, or custom integrations, get in touch:</p>
        <a href="mailto:stephcolors@hotmail.com" className="text-lg text-teal-400 underline">stephcolors@hotmail.com</a>
      </section>

      <footer className="bg-slate-800 py-6 text-center text-slate-500 text-sm">
        <p>© 2025 MeshCode. All rights reserved.</p>
      </footer>
    </main>
  );
}
