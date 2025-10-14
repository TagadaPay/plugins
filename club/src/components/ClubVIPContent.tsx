import { Benefits } from "@/components/Benefits";
import { CreditRedeemSection } from "@/components/CreditRedeemSection";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { OffersSection } from "@/components/OffersSection";
import { Testimonials } from "@/components/Testimonials";

function ClubVIPContent() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header Component */}
      <Header />

      <main className="flex-1">
        {/* Benefits Section */}
        <Benefits />

        {/* Offers/Deals Section */}
        <OffersSection />

        {/* Credit Redeem Section */}
        <CreditRedeemSection />

        {/* FAQ Section */}
        <FAQ />

        {/* Testimonials Section */}
        <Testimonials />

        {/* Call to Action */}
        {/* <CodePromoSection /> */}
      </main>

      {/* Footer Component */}
      <Footer />
    </div>
  );
}

export default ClubVIPContent;
