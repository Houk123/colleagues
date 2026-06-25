import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Решения — Коллеги",
  description: "Коллекция практических решений для агентств, студий и фрилансеров: задачи, бюджет, коммуникации, дедлайны и не только.",
  alternates: {
    canonical: "https://kollegi.ru/solutions",
  },
};

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
