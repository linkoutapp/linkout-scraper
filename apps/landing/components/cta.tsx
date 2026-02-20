import Image from "next/image";
import Stripes from "@/public/images/stripes.svg";

export default function Cta() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className="relative overflow-hidden rounded-2xl text-center shadow-xl before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gray-100"
          data-aos="zoom-y-out"
        >
          {/* Glow */}
          <div
            className="absolute bottom-0 left-1/2 -z-10 -translate-x-1/2 translate-y-1/2"
            aria-hidden="true"
          >
            <div className="h-56 w-[480px] rounded-full border-[20px] blur-3xl" style={{ borderColor: '#E4F222' }} />
          </div>
          {/* Stripes illustration — light */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 transform"
            aria-hidden="true"
          >
            <Image
              className="max-w-none"
              src={Stripes}
              width={768}
              height={432}
              alt="Stripes"
            />
          </div>
          <div className="px-4 py-12 md:px-12 md:py-20">
            <h2 className="mb-4 border-y text-3xl font-bold text-gray-900 [border-image:linear-gradient(to_right,transparent,var(--border-line,#cbd5e1),transparent)1] md:text-4xl">
              Stop losing early adopters.
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-lg text-gray-600">
              Every day without a waitlist is signups you&apos;ll never get back. Takes 60 seconds. Free, no card needed.
            </p>
            <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center gap-4">
              <a
                className="btn group mb-4 w-full text-white shadow-sm hover:opacity-90 sm:mb-0 sm:w-auto"
                style={{ background: '#1C1B18' }}
                href="https://w8list-backend-production.up.railway.app/dashboard"
              >
                <span className="relative inline-flex items-center">
                  Start Collecting Signups{" "}
                  <span className="ml-1 tracking-normal text-gray-400 transition-transform group-hover:translate-x-0.5">
                    -&gt;
                  </span>
                </span>
              </a>
              <a
                className="btn w-full bg-white text-gray-800 shadow-sm hover:bg-gray-50 border border-gray-200 sm:w-auto"
                href="#demo"
              >
                See the Demo
              </a>
            </div>
            <p className="mt-6 text-sm text-gray-400">Free forever up to 200 signups. No lock-in.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
