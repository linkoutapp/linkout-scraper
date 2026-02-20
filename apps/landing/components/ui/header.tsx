"use client";

import { useState } from "react";
import Logo from "./logo";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-2 z-30 w-full md:top-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl bg-white/90 px-3 shadow-lg shadow-black/[0.03] backdrop-blur-xs before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(var(--color-gray-100),var(--color-gray-200))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] ">
          {/* Site branding */}
          <div className="relative z-10 flex flex-1 items-center">
            <Logo />
          </div>

          {/* Desktop nav links */}
          <ul className="relative z-10 hidden flex-1 items-center justify-end gap-6 md:flex">
            <li>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
              >
                How It Works
              </a>
            </li>
            <li>
              <a
                href="#pricing"
                className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
              >
                Pricing
              </a>
            </li>
            <li>
              <a
                href="https://w8list-backend-production.up.railway.app/dashboard"
                className="btn-sm text-white shadow-sm hover:opacity-90" style={{ background: '#1C1B18' }}
              >
                Get Started
              </a>
            </li>
          </ul>

          {/* Mobile: hamburger */}
          <div className="relative z-10 flex items-center gap-3 md:hidden">
            <button
              className="flex h-8 w-8 items-center justify-center text-gray-600"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                {mobileOpen ? (
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="mt-2 rounded-xl bg-white/95 px-4 py-4 shadow-lg backdrop-blur-xs md:hidden">
            <ul className="flex flex-col gap-4">
              <li>
                <a
                  href="#how-it-works"
                  className="block text-sm font-medium text-gray-600 transition hover:text-gray-900"
                  onClick={() => setMobileOpen(false)}
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="block text-sm font-medium text-gray-600 transition hover:text-gray-900"
                  onClick={() => setMobileOpen(false)}
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#demo"
                  className="btn-sm inline-block text-center text-white shadow-sm hover:opacity-90" style={{ background: '#1C1B18' }}
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
