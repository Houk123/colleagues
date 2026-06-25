import type { Metadata } from "next";
import "./globals.css";
import { Box } from "@chakra-ui/react";
import { Provider } from "./provider";
import { ClientProviders } from "./client-providers";
import { AppHeader } from "@/widgets/AppHeader";
import { Footer } from "@/widgets/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://kollegi.ru"),
  title: "Коллеги — рабочее пространство для агентств и фрилансеров",
  description:
    "Управляйте порталами, проектами, задачами, финансами и коммуникациями в одной платформе. Бесплатно для команд до 5 человек.",
  alternates: {
    canonical: "https://kollegi.ru/",
  },
  openGraph: {
    title: "Коллеги — рабочее пространство для агентств и фрилансеров",
    description:
      "Управляйте порталами, проектами, задачами, финансами и коммуникациями в одной платформе.",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Коллеги — рабочее пространство для агентств и фрилансеров",
    description:
      "Управляйте порталами, проектами, задачами, финансами и коммуникациями в одной платформе.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Provider>
          <ClientProviders>
            <AppHeader />
            <Box flex="1" display="flex" flexDirection="column">
              {children}
            </Box>
            <Footer />
          </ClientProviders>
        </Provider>
      </body>
    </html>
  );
}
