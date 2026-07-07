import { HeroSection } from '@/components/home/HeroSection';
import { ServiceGroups } from '@/components/home/ServiceGroups';
import { Advantages } from '@/components/home/Advantages';
import { FeaturedListings } from '@/components/home/FeaturedListings';
import { AdminServices } from '@/components/home/AdminServices';
import { FinalCta } from '@/components/home/FinalCta';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServiceGroups />
      <Advantages />
      <FeaturedListings />
      <AdminServices />
      <FinalCta />
    </>
  );
}
