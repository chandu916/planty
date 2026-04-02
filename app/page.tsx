import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import PlantSections from "./components/PlantSections";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-transparent">
      <Navbar />
      <Hero />
      <PlantSections />
      <Footer />
    </main>
  );
}
