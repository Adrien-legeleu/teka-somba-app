'use client';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function DonSection({
  isDon,
  setIsDon,
}: {
  isDon: boolean;
  setIsDon: (val: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor="don-filter" className="font-semibold text-sm">
        Dons uniquement
      </Label>
      <Switch id="don-filter" checked={isDon} onCheckedChange={setIsDon} />
    </div>
  );
}
