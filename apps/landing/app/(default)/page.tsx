export const metadata = {
  title: "w8list — Adaptive waitlist forms that match any site",
  description: "Drop one script tag. Get a waitlist form that auto-adapts to your site's colors, fonts, and style. See signups in a dashboard. Free to start.",
};

import Hero from "@/components/hero-home";
import BusinessCategories from "@/components/business-categories";
import FeaturesPlanet from "@/components/features-planet";
import LargeTestimonial from "@/components/large-testimonial";
import Cta from "@/components/cta";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "w8list",
  applicationCategory: "BusinessApplication",
  url: "https://w8list.com",
  description: "Embeddable waitlist forms that auto-adapt to your site's UI — colors, fonts, dark mode. Dashboard, referral system, and API included.",
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      name: "Free",
    },
    {
      "@type": "Offer",
      price: "19",
      priceCurrency: "USD",
      name: "Pro",
      billingIncrement: "P1M",
    },
  ],
  author: {
    "@type": "Organization",
    name: "w8list",
    url: "https://w8list.com",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <FeaturesPlanet />
      <LargeTestimonial />
      <BusinessCategories />
      <Cta />
    </>
  );
}
