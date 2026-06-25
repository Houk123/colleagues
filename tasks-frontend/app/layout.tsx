import type { Metadata } from "next";
import "./globals.css";
import { Provider } from "./provider";
import { ClientProviders } from "./client-providers";
import { AppHeader } from "@/widgets/AppHeader";

export const metadata: Metadata = {
  title: "Коллеги — рабочее пространство для агентств и фрилансеров",
  description:
    "Управляйте порталами, проектами, задачами, финансами и коммуникациями в одной платформе. Бесплатно для команд до 5 человек.",
  robots: "index, follow",
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
      <body>
        <Provider>
          <ClientProviders>
            <AppHeader />
            {children}
          </ClientProviders>
        </Provider>
      </body>
    </html>
  );
}
