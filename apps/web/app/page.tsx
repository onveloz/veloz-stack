import { HomeCta, HomeFeatures, HomeHero } from "./home-sections";
import { SiteFooter, SiteHeader } from "./site-chrome";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <HomeHero />
        <HomeFeatures />
        <HomeCta />
      </main>
      <SiteFooter />
    </div>
  );
}
