'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function DonSwitch({
  isDon,
  setIsDon,
}: {
  isDon: boolean;
  setIsDon: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch id="don-filter" checked={isDon} onCheckedChange={setIsDon} />
      <Label htmlFor="don-filter">Dons uniquement</Label>
    </div>
  );
}
