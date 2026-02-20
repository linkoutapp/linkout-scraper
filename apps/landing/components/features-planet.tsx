import { Paintbrush, Eye, Code2, BarChart3, Share2, Zap } from "lucide-react";

export default function FeaturesPlanet() {
  const features = [
    {
      icon: Paintbrush,
      title: "Auto-Adaptive UI",
      desc: "Grabs your site's colors, fonts, border radius, dark mode. Form blends right in. No CSS needed.",
    },
    {
      icon: Eye,
      title: "Live Dashboard",
      desc: "Watch signups pop up live. Filter, search, CSV export. See exactly who's waiting.",
    },
    {
      icon: Code2,
      title: "One Script Tag",
      desc: "Paste one line of HTML. Runs on React, Next.js, Astro, vanilla HTML, whatever has a DOM.",
    },
    {
      icon: Share2,
      title: "Viral Referrals",
      desc: "Every signup gets their own link. Share it, climb the waitlist. Growth hacks itself.",
    },
    {
      icon: BarChart3,
      title: "Analytics Built In",
      desc: "Signup trends, referral wins, top sharers. No extra tools. Just works.",
    },
    {
      icon: Zap,
      title: "API-First",
      desc: "Full REST API for signups, projects, referrals. Whip up integrations fast.",
    },
  ];

  return (
    <section className="relative before:absolute before:inset-0 before:-z-20 before:bg-gray-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="mx-auto max-w-3xl pb-16 text-center md:pb-20">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Everything you need to launch
            </h2>
          </div>
          {/* Grid */}
          <div className="grid overflow-hidden sm:grid-cols-2 lg:grid-cols-3 *:relative *:p-6 *:before:absolute *:before:bg-gray-200 *:before:[block-size:100vh] *:before:[inline-size:1px] *:before:[inset-block-start:0] *:before:[inset-inline-start:-1px] *:after:absolute *:after:bg-gray-200 *:after:[block-size:1px] *:after:[inline-size:100vw] *:after:[inset-block-start:-1px] *:after:[inset-inline-start:0] md:*:p-10">
            {features.map((f) => (
              <article key={f.title}>
                <h3 className="mb-2 flex items-center space-x-2 font-medium text-gray-900">
                  <f.icon className="h-4 w-4" style={{ color: '#1C1B18' }} strokeWidth={2} />
                  <span>{f.title}</span>
                </h3>
                <p className="text-[15px] text-gray-600">{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
