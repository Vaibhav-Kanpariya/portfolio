import type { Metadata } from "next";
import WorldPage from "@/world/WorldPage";

export const metadata: Metadata = {
  title: "Vaibhav Kanpariya | Drive through my work",
  description:
    "A small world you drive through. Knock over my name, find the projects, crash into the skills, and park at the mailbox to get in touch.",
};

export default function Home() {
  return <WorldPage />;
}
