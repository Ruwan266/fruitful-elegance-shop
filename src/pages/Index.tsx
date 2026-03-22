import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import CategoryGrid from "@/components/home/CategoryGrid";
import OffersSection from "@/components/home/OffersSection";
import BestSellers from "@/components/home/BestSellers";
import BoxBuilderTeaser from "@/components/home/BoxBuilderTeaser";
import Testimonials from "@/components/home/Testimonials";
import CorporateGifting from "@/components/home/CorporateGifting";
import Newsletter from "@/components/home/Newsletter";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <CategoryGrid />
      <OffersSection />
      <BestSellers />
      <BoxBuilderTeaser />
      <CorporateGifting />
      <Testimonials />
      <Newsletter />
    </Layout>
  );
};

export default Index;
