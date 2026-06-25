import HomePage from "@/screens/HomePage";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Коллеги",
  url: "https://kollegi.ru",
  logo: "https://kollegi.ru/logo.svg",
  sameAs: [],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <HomePage />
    </>
  );
}
