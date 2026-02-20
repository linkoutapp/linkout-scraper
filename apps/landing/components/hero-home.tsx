"use client";

import PageIllustration from "@/components/page-illustration";

export default function HeroHome() {
  return (
    <section className="relative" id="demo">
      <PageIllustration />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 pt-32 md:pb-20 md:pt-40">
          {/* Header */}
          <div className="pb-12 text-center md:pb-16">
            <div
              className="mb-6 border-y [border-image:linear-gradient(to_right,transparent,var(--border-line,#cbd5e1),transparent)1]"
              data-aos="zoom-y-out"
            >
              <div className="flex justify-center py-1.5">
                <span className="inline-flex items-center gap-2 rounded-full px-4 py-1 text-sm font-medium" style={{ background: '#E4F22230', color: '#1C1B18' }}>
                  <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: '#1C1B18' }} />
                  One script tag. Zero config.
                </span>
              </div>
            </div>
            <h1
              className="mb-6 border-y text-5xl font-bold [border-image:linear-gradient(to_right,transparent,var(--border-line,#cbd5e1),transparent)1] md:text-6xl"
              data-aos="zoom-y-out"
              data-aos-delay={150}
            >
              One script tag. <br className="max-lg:hidden" />
              AI does the rest.
            </h1>
            <div className="mx-auto max-w-3xl">
              <p
                className="mb-8 text-lg text-gray-700"
                data-aos="zoom-y-out"
                data-aos-delay={300}
              >
                Our AI reads your site&apos;s design system and generates a waitlist widget that looks like you built it. Colors, fonts, spacing, dark mode. All automatic.
              </p>
              <div className="relative before:absolute before:inset-0 before:border-y before:[border-image:linear-gradient(to_right,transparent,var(--border-line,#cbd5e1),transparent)1]">
                <div
                  className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center"
                  data-aos="zoom-y-out"
                  data-aos-delay={450}
                >
                  <a
                    className="btn group mb-4 w-full text-white shadow-sm hover:opacity-90 sm:mb-0 sm:w-auto"
                    style={{ background: '#1C1B18' }}
                    href="https://w8list-backend-production.up.railway.app/sign-up"
                  >
                    <span className="relative inline-flex items-center">
                      Sign Up Free{" "}
                      <span className="ml-1 tracking-normal text-gray-400 transition-transform group-hover:translate-x-0.5">
                        -&gt;
                      </span>
                    </span>
                  </a>
                  <a
                    className="btn w-full bg-white text-gray-800 shadow-sm hover:bg-gray-50 sm:ml-4 sm:w-auto"
                    href="#how-it-works"
                  >
                    See How It Works
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ScreenStudio-style animated demo */}
          <div
            className="mx-auto max-w-5xl"
            data-aos="zoom-y-out"
            data-aos-delay={600}
          >
            {/* Viewport — clips the stage, acts as the "camera" */}
            <div className="demo-viewport relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-2xl" style={{ aspectRatio: "16/9" }}>
              {/* macOS cursor */}
              <div className="demo-cursor pointer-events-none absolute z-50">
                <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
                  <path d="M1.5 0.5L1.5 18L5.2 14.2L9.5 21L12.5 19.5L8.2 12.8L13.5 12L1.5 0.5Z" fill="#1c1c1e" stroke="#ffffff" strokeWidth="1.2" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Click ripple effect */}
              <div className="demo-click pointer-events-none absolute z-40 h-6 w-6 rounded-full border-2 opacity-0" style={{ borderColor: '#E4F222' }} />

              {/* Stage — the large canvas that the camera pans/zooms around */}
              <div className="demo-stage absolute inset-0 origin-top-left">
                {/* Layout: script tag on top, two sites below side by side */}
                <div className="flex h-full flex-col">
                  {/* Script tag — top center */}
                  <div className="flex shrink-0 items-center justify-center px-8 pt-6 pb-4">
                    <div className="demo-script-tag relative flex items-center gap-3 rounded-lg bg-gray-100 border border-gray-200 px-5 py-3">
                      {/* Selection highlight */}
                      <div className="demo-selection absolute inset-1 rounded bg-blue-500/15 opacity-0" />
                      <code className="relative z-10 font-mono text-[11px] leading-relaxed">
                        <span className="text-purple-600">&lt;script </span>
                        <span className="text-blue-600">src</span>
                        <span className="text-gray-400">=</span>
                        <span className="text-green-600">&quot;https://w8list.com/embed.js&quot;</span>
                        <span className="text-blue-600"> data-project</span>
                        <span className="text-gray-400">=</span>
                        <span className="text-green-600">&quot;abc123&quot;</span>
                        <span className="text-purple-600">&gt;&lt;/script&gt;</span>
                      </code>
                      {/* Copy icon → checkmark */}
                      <div className="demo-copy-icon relative z-10 shrink-0">
                        <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                        </svg>
                      </div>
                      <div className="demo-check-icon absolute right-5 z-10 shrink-0 opacity-0">
                        <svg className="h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {/* Copied badge */}
                      <span className="demo-copied absolute -top-3 right-2 rounded bg-green-600 px-2 py-0.5 text-[9px] font-bold text-white opacity-0">Copied!</span>
                    </div>
                  </div>

                  {/* Two sites side by side */}
                  <div className="grid flex-1 grid-cols-2 gap-4 px-6 pb-6">
                    {/* LEFT: Stripe-style — violet/white, rounded, clean */}
                    <div className="overflow-hidden rounded-2xl border border-violet-200/60 bg-white">
                      <div className="flex items-center gap-1.5 border-b border-violet-100/60 bg-white/80 px-3 py-2">
                        <span className="h-2 w-2 rounded-full bg-red-400" />
                        <span className="h-2 w-2 rounded-full bg-yellow-400" />
                        <span className="h-2 w-2 rounded-full bg-green-400" />
                        <span className="ml-2 flex-1 rounded-full bg-violet-50 px-2 py-0.5 text-center text-[9px] text-violet-400">stripe.com</span>
                      </div>
                      <div className="px-5 py-5">
                        <div className="mb-5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-lg" style={{ background: '#635BFF' }} />
                            <span className="text-xs font-bold text-gray-900">Stripe</span>
                          </div>
                          <div className="flex gap-2">
                            <div className="h-1.5 w-10 rounded-full bg-violet-100" />
                            <div className="h-1.5 w-8 rounded-full bg-violet-50" />
                          </div>
                        </div>
                        <div className="mb-5 text-center">
                          <div className="mx-auto mb-2 h-2.5 w-44 rounded-full bg-violet-100/60" />
                          <div className="mx-auto h-1.5 w-32 rounded-full bg-violet-50" />
                        </div>
                        {/* Generative form — rounded, violet accent, staggered reveal */}
                        <div className="demo-form-left mx-auto max-w-[240px] opacity-0">
                          <div className="rounded-2xl border border-violet-200/60 bg-white p-3 shadow-sm">
                            <p className="gen-row-1 mb-2 text-center text-[10px] font-semibold text-gray-900 opacity-0">Join the waitlist</p>
                            <div className="gen-row-2 mb-1.5 rounded-full border border-violet-200 bg-violet-50/50 px-3 py-1 opacity-0">
                              <span className="block text-center text-[9px] text-gray-400">your@email.com</span>
                            </div>
                            <div className="gen-row-3 rounded-full py-1 text-center text-[9px] font-medium text-white opacity-0" style={{ background: '#635BFF' }}>
                              Join Waitlist
                            </div>
                            <p className="gen-row-4 mt-1.5 text-center text-[8px] text-violet-400 opacity-0">237 people ahead of you</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: HackerRank-style — dark bg, green accents, sharp edges */}
                    <div className="overflow-hidden rounded-lg border border-gray-700/60" style={{ background: '#1a1a2e' }}>
                      <div className="flex items-center gap-1.5 border-b border-gray-700/40 px-3 py-2" style={{ background: '#16213e' }}>
                        <span className="h-2 w-2 rounded-full bg-red-500/60" />
                        <span className="h-2 w-2 rounded-full bg-yellow-500/60" />
                        <span className="h-2 w-2 rounded-full bg-green-500/60" />
                        <span className="ml-2 flex-1 rounded-sm px-2 py-0.5 text-center text-[9px] font-mono text-green-400/70" style={{ background: '#0f3460' }}>hackerrank.com</span>
                      </div>
                      <div className="px-5 py-5">
                        <div className="mb-5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-sm" style={{ background: '#00EA64' }} />
                            <span className="text-xs font-bold font-mono text-green-400">HackerRank</span>
                          </div>
                          <div className="flex gap-2">
                            <div className="h-1.5 w-10 rounded-sm" style={{ background: '#0f3460' }} />
                            <div className="h-1.5 w-8 rounded-sm" style={{ background: '#0f3460' }} />
                          </div>
                        </div>
                        <div className="mb-5 text-center">
                          <div className="mx-auto mb-2 h-2.5 w-44 rounded-sm" style={{ background: '#0f3460' }} />
                          <div className="mx-auto h-1.5 w-32 rounded-sm" style={{ background: '#16213e' }} />
                        </div>
                        {/* Generative form — dark, green accent, staggered reveal */}
                        <div className="demo-form-right mx-auto max-w-[240px] opacity-0">
                          <div className="rounded-lg border border-gray-700/60 p-3" style={{ background: '#16213e' }}>
                            <p className="gen-row-1r mb-2 text-center text-[10px] font-mono font-semibold text-green-400 opacity-0">Join the waitlist</p>
                            <div className="gen-row-2r mb-1.5 rounded-sm border border-gray-600/40 px-3 py-1 opacity-0" style={{ background: '#1a1a2e' }}>
                              <span className="block text-center text-[9px] font-mono text-gray-500">your@email.com</span>
                            </div>
                            <div className="gen-row-3r rounded-sm py-1 text-center text-[9px] font-mono font-medium text-gray-900 opacity-0" style={{ background: '#00EA64' }}>
                              Join Waitlist
                            </div>
                            <p className="gen-row-4r mt-1.5 text-center text-[8px] font-mono text-green-400/60 opacity-0">237 people ahead of you</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-sm text-gray-500" data-aos="fade-up" data-aos-delay={800}>
              Same script tag. Stripe or HackerRank — the form adapts automatically.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
