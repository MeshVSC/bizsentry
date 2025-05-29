import React from 'react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <main className="bg-slate-900 text-slate-200 font-sans">
      <div className="px-6 py-16 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-teal-400">Inventory Made Simple</h1>
        <p className="mt-4 text-lg">Track, manage, and monitor your stock—without the clutter or the cost.</p>
      </div>

      <div className="px-6 py-12 max-w-5xl mx-auto">
        <h2 className="text-2xl text-teal-400 font-semibold mb-6">Features</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
          <div>🔐 Role-based user access</div>
          <div>📊 Real-time dashboard metrics</div>
          <div>📂 Product & category organization</div>
          <div>📝 Receipt uploads for reference</div>
          <div>💻 Cross-device compatibility</div>
        </div>
      </div>

      <div className="px-6 py-12 max-w-5xl mx-auto">
        <h2 className="text-2xl text-teal-400 font-semibold mb-4">Why Use StockSentry?</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>100% Free</li>
          <li>No setup fees, no subscriptions</li>
          <li>Designed for speed and clarity</li>
          <li>Ideal for solopreneurs, small teams, and makers</li>
        </ul>
      </div>

      <div className="px-6 py-12 max-w-5xl mx-auto">
        <h2 className="text-2xl text-teal-400 font-semibold mb-4">Showcase</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Image src="/images/mockup-desktop.png" alt="Desktop Mockup" width={800} height={500} className="rounded shadow" />
          <Image src="/images/mockup-mobile.png" alt="Mobile Mockup" width={400} height={800} className="rounded shadow" />
        </div>
      </div>

      <div className="bg-slate-800 text-center py-12 px-6 rounded-lg max-w-5xl mx-auto my-12">
        <h2 className="text-2xl text-teal-400 font-semibold">Start using StockSentry now</h2>
        <p className="my-4">No signup required. Just manage your inventory.</p>
        <p>
          <a href="#" className="text-teal-400 underline">Use it Free</a> or <a href="#" className="text-teal-400 underline">View on GitHub</a>
        </p>
      </div>

      <div className="px-6 py-12 max-w-5xl mx-auto">
        <h2 className="text-2xl text-teal-400 font-semibold mb-4">FAQ</h2>
        <p><strong>Is it free?</strong> Yes. No hidden costs. Just free.</p>
        <p><strong>Can I host it myself?</strong> Absolutely. Clone the repo and go.</p>
        <p><strong>Can I resell it?</strong> No. It’s free for personal/internal use only.<br />
          For licensing: <a href="mailto:stephcolors@hotmail.com" className="text-teal-400 underline">stephcolors@hotmail.com</a>
        </p>
      </div>

      <footer className="text-center text-sm text-slate-500 py-12">
        <p>© 2025 MeshCode. All rights reserved.</p>
      </footer>
    </main>
  );
}