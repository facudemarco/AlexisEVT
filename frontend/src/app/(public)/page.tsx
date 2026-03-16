import { HeroSection } from "@/components/home/HeroSection";
import { CategoryList } from "@/components/home/CategoryList";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { AdventureCarousel } from "@/components/home/AdventureCarousel";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { CallToActionBanner } from "@/components/home/CallToActionBanner";
import { Footer } from "@/components/home/Footer";

// Obtenemos los datos del JSON local
import reviewsLocal from "@/data/reviews.json";

export default function Home() {
  return (
    <div className="bg-surface-muted min-h-screen flex flex-col">
      <HeroSection />
      <CategoryList />
      <FeaturesSection />
      <AdventureCarousel />
      <ReviewsSection reviews={reviewsLocal} />
      <CallToActionBanner />
      <Footer />
    </div>
  );
}
