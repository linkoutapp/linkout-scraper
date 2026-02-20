import Image from "next/image";

import Stripes from "@/public/images/stripes.svg";
import StripesDark from "@/public/images/stripes-dark.svg";

export default function PageIllustration() {
  return (
    <>
      {/* Stripes — light version */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 transform"
        aria-hidden="true"
      >
        <Image
          className="max-w-none"
          src={Stripes}
          width={768}
          alt="Stripes"
          priority
        />
      </div>
      {/* Stripes — dark version */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 transform hidden"
        aria-hidden="true"
      >
        <Image
          className="max-w-none"
          src={StripesDark}
          width={768}
          alt="Stripes"
          priority
        />
      </div>
      {/* Circles */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 ml-[580px] -translate-x-1/2"
        aria-hidden="true"
      >
        <div className="h-80 w-80 rounded-full opacity-50 blur-[160px]" style={{ background: 'linear-gradient(to top right, #E4F222, #E4F22260)' }} />
      </div>
      <div
        className="pointer-events-none absolute left-1/2 top-[420px] ml-[380px] -translate-x-1/2"
        aria-hidden="true"
      >
        <div className="h-80 w-80 rounded-full opacity-50 blur-[160px]" style={{ background: 'linear-gradient(to top right, #E4F222, #1C1B18)' }} />
      </div>
      <div
        className="pointer-events-none absolute left-1/2 top-[640px] -ml-[300px] -translate-x-1/2"
        aria-hidden="true"
      >
        <div className="h-80 w-80 rounded-full opacity-50 blur-[160px]" style={{ background: 'linear-gradient(to top right, #E4F222, #1C1B18)' }} />
      </div>
    </>
  );
}
