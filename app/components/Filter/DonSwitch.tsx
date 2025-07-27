'use client';

import { Label } from '@/components/ui/label';

export function DonSection({
  isDon,
  setIsDon,
}: {
  isDon: boolean;
  setIsDon: (val: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="don-filter" className="font-semibold text-xs">
        Dons uniquement
      </Label>

      <label className="relative inline-block w-[46px] h-[24px] cursor-pointer">
        <input
          type="checkbox"
          id="don-filter"
          checked={isDon}
          onChange={(e) => setIsDon(e.target.checked)}
          className="hidden"
        />
        {/* Slider */}
        <div
          className={`w-full h-full rounded-full transition-colors duration-300 ${
            isDon ? 'bg-green-500' : 'bg-gray-400'
          }`}
        >
          <div
            className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-all duration-300 flex items-center justify-center ${
              isDon ? 'translate-x-[22px]' : 'translate-x-0'
            }`}
          >
            {/* Cross */}
            <svg
              className={`w-[6px] text-gray-400 absolute transition-transform duration-200 ${
                isDon
                  ? 'opacity-0 scale-0 animate-switch-cross-to-check'
                  : 'opacity-100 scale-100'
              }`}
              viewBox="0 0 365.696 365.696"
            >
              <path
                fill="currentColor"
                d="M243.188 182.86 356.32 69.726c12.5-12.5 12.5-32.766 0-45.247L341.238 9.398c-12.504-12.503-32.77-12.503-45.25 0L182.86 122.528 69.727 9.374c-12.5-12.5-32.766-12.5-45.247 0L9.375 24.457c-12.5 12.504-12.5 32.77 0 45.25l113.152 113.152L9.398 295.99c-12.503 12.503-12.503 32.769 0 45.25L24.48 356.32c12.5 12.5 32.766 12.5 45.247 0l113.132-113.132L295.99 356.32c12.503 12.5 32.769 12.5 45.25 0l15.081-15.082c12.5-12.504 12.5-32.77 0-45.25zm0 0"
              ></path>
            </svg>

            {/* Checkmark */}
            <svg
              className={`w-[10px] text-green-500 absolute transition-transform duration-200 ${
                isDon
                  ? 'opacity-100 scale-100 animate-switch-check-to-cross'
                  : 'opacity-0 scale-0'
              }`}
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z"
              ></path>
            </svg>
          </div>
        </div>
      </label>
    </div>
  );
}
