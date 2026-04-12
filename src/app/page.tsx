import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Work from "@/components/sections/Work";
import Experience from "@/components/sections/Experience";
import Ending from "@/components/sections/Ending";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Work />
      <Experience />
      <Ending />
    </>
  );
}
