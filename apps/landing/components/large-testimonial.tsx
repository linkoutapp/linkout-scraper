export default function LargeTestimonial() {
  const steps = [
    {
      title: "Create a project",
      desc: "Sign up, name your waitlist, get your project ID. Takes 30 seconds.",
      visual: (
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 px-4 py-3">
            <span className="text-xs font-medium text-gray-500">w8list / dashboard</span>
          </div>
          <div className="px-4 py-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: '#E4F222', color: '#1C1B18' }}>A</div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Acme Launch</div>
                <div className="text-[11px] text-gray-400">Project ID: abc123</div>
              </div>
            </div>
            <div className="flex gap-4 text-[11px] text-gray-500">
              <span>0 signups</span>
              <span>Created just now</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Drop the script tag",
      desc: "One line of HTML. Paste it anywhere on your site. The form appears and matches automatically.",
      visual: (
        <div className="mt-4 overflow-hidden rounded-xl bg-gray-100 shadow-lg">
          <div className="flex items-center gap-1.5 border-b border-gray-200 px-4 py-2.5">
            <span className="h-3 w-3 rounded-full bg-gray-300" />
            <span className="h-3 w-3 rounded-full bg-gray-300" />
            <span className="h-3 w-3 rounded-full bg-gray-300" />
          </div>
          <div className="px-4 py-3 font-mono text-[12px] leading-relaxed overflow-x-auto">
            <span className="text-purple-600">&lt;script </span>
            <span className="text-blue-600">src</span>
            <span className="text-gray-600">=</span>
            <span className="text-green-600">&quot;https://w8list.com/embed.js&quot;</span>
            <span className="text-blue-600"> data-project</span>
            <span className="text-gray-600">=</span>
            <span className="text-green-600">&quot;abc123&quot;</span>
            <span className="text-purple-600">&gt;&lt;/script&gt;</span>
          </div>
        </div>
      ),
    },
    {
      title: "Watch signups roll in",
      desc: "Every signup appears in your dashboard in real time. Export, analyze, and launch when ready.",
      visual: (
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {/* Dashboard chrome */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded" style={{ background: '#E4F222' }}>
                <svg className="h-3 w-3" style={{ color: '#1C1B18', fill: '#1C1B18' }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </span>
              <span className="text-xs font-semibold text-gray-900">Acme Launch</span>
            </div>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">+12 today</span>
          </div>
          {/* Toolbar */}
          <div className="flex items-center gap-2 border-b border-gray-50 px-4 py-2">
            <div className="flex-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] text-gray-400">Search signups...</div>
            <div className="rounded-md border border-gray-200 px-2 py-1 text-[10px] font-medium text-gray-600">Export CSV</div>
          </div>
          {/* Signup rows */}
          <div className="divide-y divide-gray-100">
            {[
              { name: "Sarah Chen", email: "sarah@startup.io", pos: "#1", time: "2m ago" },
              { name: "Alex Rivera", email: "alex@devtools.com", pos: "#2", time: "8m ago" },
              { name: "Jamie Park", email: "jamie@design.co", pos: "#3", time: "14m ago" },
            ].map((s) => (
              <div key={s.email} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-gray-300">{s.pos}</span>
                  <div>
                    <div className="text-xs font-medium text-gray-900">{s.name}</div>
                    <div className="text-[10px] text-gray-400">{s.email}</div>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400">{s.time}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          <div className="mx-auto max-w-3xl">
            <h2
              className="mb-12 text-center text-3xl font-bold md:mb-16 md:text-4xl"
              data-aos="fade-up"
            >
              How it works
            </h2>

            <div className="relative space-y-0">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="relative flex gap-6 pb-12 last:pb-0"
                  data-aos="fade-up"
                  data-aos-delay={i * 200}
                >
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg" style={{ background: '#1C1B18' }}>
                      {i + 1}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="mt-2 w-px grow bg-gradient-to-b from-gray-300 to-transparent" />
                    )}
                  </div>

                  <div className="grow pb-2 pt-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{step.desc}</p>
                    <div data-aos="zoom-in" data-aos-delay={i * 200 + 150}>
                      {step.visual}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
