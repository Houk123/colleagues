import { notFound } from "next/navigation";
import { Metadata } from "next";
import SolutionPage from "@/screens/SolutionPage";
import { solutionBySlug, solutions } from "@/screens/solutions/data";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const solution = solutionBySlug(slug);

  if (!solution) {
    return {
      title: "Страница не найдена — Коллеги",
    };
  }

  const url = `https://kollegi.ru/solutions/${solution.slug}`;

  return {
    title: solution.title,
    description: solution.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: solution.title,
      description: solution.description,
      type: "article",
      url,
      images: [solution.ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: solution.title,
      description: solution.description,
      images: [solution.ogImage],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const solution = solutionBySlug(slug);

  if (!solution) {
    notFound();
  }

  return <SolutionPage slug={slug} />;
}
