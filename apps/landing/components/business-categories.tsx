export default function BusinessCategories() {
  const check = (
    <svg className="h-4 w-4 shrink-0" style={{ fill: '#1C1B18' }} viewBox="0 0 16 16"><path d="M14.29 2.614a1 1 0 0 0-1.58-1.228L6.407 9.492l-3.199-3.2a1 1 0 1 0-1.414 1.415l4 4a1 1 0 0 0 1.496-.093l7-9Z" /></svg>
  );

  return (
    <section id="pricing">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 pt-12 md:pb-20">
          <div className="mx-auto max-w-3xl pb-12 text-center md:pb-16">
            <h2 className="text-3xl font-bold md:text-4xl">Simple pricing.</h2>
            <p className="mt-4 text-lg text-gray-700">
              Free to start. Upgrade when you grow.
            </p>
          </div>
          <div className="mx-auto grid max-w-sm gap-8 sm:max-w-none sm:grid-cols-2 lg:max-w-3xl">
            {/* Free */}
            <div className="relative flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Free</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">$0</span>
                  <span className="ml-1 text-gray-500">/month</span>
                </div>
              </div>
              <ul className="mb-8 grow space-y-3 text-sm text-gray-700">
                <li className="flex items-center gap-2">{check} 1 project</li>
                <li className="flex items-center gap-2">{check} 200 signups</li>
                <li className="flex items-center gap-2">{check} Auto-adaptive form</li>
                <li className="flex items-center gap-2">{check} Dashboard + CSV export</li>
                <li className="flex items-center gap-2">{check} REST API</li>
              </ul>
              <a
                className="btn w-full bg-white text-gray-800 shadow-sm hover:bg-gray-50 border border-gray-200"
                href="https://w8list-backend-production.up.railway.app/dashboard"
              >
                Get Started
              </a>
            </div>
            {/* Pro */}
            <div className="relative flex flex-col rounded-2xl border-2 bg-white p-8 shadow-lg" style={{ borderColor: '#E4F222' }}>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Pro</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">$19</span>
                  <span className="ml-1 text-gray-500">/month</span>
                </div>
              </div>
              <ul className="mb-8 grow space-y-3 text-sm text-gray-700">
                <li className="flex items-center gap-2">{check} Unlimited projects</li>
                <li className="flex items-center gap-2">{check} Unlimited signups</li>
                <li className="flex items-center gap-2">{check} Viral referral system</li>
                <li className="flex items-center gap-2">{check} Remove w8list branding</li>
                <li className="flex items-center gap-2">{check} Analytics + top referrers</li>
                <li className="flex items-center gap-2">{check} Everything in Free</li>
              </ul>
              <a
                className="btn w-full text-white shadow-sm hover:opacity-90"
                style={{ background: '#1C1B18' }}
                href="https://w8list-backend-production.up.railway.app/dashboard"
              >
                Start Free, Upgrade Later
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
