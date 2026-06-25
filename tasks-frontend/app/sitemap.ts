import type { MetadataRoute } from "next";
import { solutions } from "@/screens/solutions/data";

const BASE_URL = "https://kollegi.ru";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: "/", priority: 1.0 },
    { url: "/login", priority: 0.5 },
    { url: "/register", priority: 0.6 },
    { url: "/portals", priority: 0.6 },
    { url: "/join-portal", priority: 0.5 },
    { url: "/portal-requests", priority: 0.5 },
  ];

  const solutionPages = solutions.map((solution) => ({
    url: `/solutions/${solution.slug}`,
    priority: 0.8,
  }));

  return [...staticPages, ...solutionPages].map((page) => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: new Date().toISOString().split("T")[0],
    changeFrequency: "weekly" as const,
    priority: page.priority,
  }));
}
