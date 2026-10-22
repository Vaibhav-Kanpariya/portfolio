import Background from "@/components/galaxy/Background";
import TopBar from "@/components/TopBar";
import RegionNav from "@/components/RegionNav";
import Intro from "@/components/sections/Intro";
import Impact from "@/components/sections/Impact";
import Career from "@/components/sections/Career";
import Mastermind from "@/components/sections/Mastermind";
import Ntn from "@/components/sections/Ntn";
import Skills from "@/components/sections/Skills";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Background />
      <TopBar />
      <RegionNav />
      <main className="pointer-events-none relative z-[2]">
        <Intro />
        <Impact />
        <Career />
        <Mastermind />
        <Ntn />
        <Skills />
        <Contact />
      </main>
    </>
  );
}
