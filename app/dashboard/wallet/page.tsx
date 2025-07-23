import { PremiumOffers } from '@/app/components/Payment/premiumOffers';
import WalletRecharge from '@/app/components/Payment/WalletRecharge';

export default function WalletPage() {
  return (
    <div className="grid md:grid-cols-2 gap-8 p-6">
      <WalletRecharge />
      {/* Tu peux mettre adId ici quand tu veux acheter une offre */}
      <PremiumOffers adId="ID_DE_L_ANNONCE" />
    </div>
  );
}
