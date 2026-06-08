'use client';

import { useState } from 'react';

interface EhrLogoProps {
  slug: string;
  initials: string;
  name: string;
  colorClass: string;
  // Only attempt to load an image when the official logo file has been added
  // to /public/images/ehr/<slug>.(svg|png). Otherwise show the initials badge
  // with no network request (prevents 404s for logos that aren't present yet).
  hasLogo?: boolean;
}

export default function EhrLogo({ slug, initials, name, colorClass, hasLogo = false }: EhrLogoProps) {
  const [src, setSrc] = useState(`/images/ehr/${slug}.svg`);
  const [failed, setFailed] = useState(false);

  if (!hasLogo || failed) {
    return (
      <div className={`${colorClass} text-white rounded-xl w-12 h-12 flex items-center justify-center font-bold text-sm flex-shrink-0`}>
        {initials}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray/10 rounded-xl w-12 h-12 flex items-center justify-center flex-shrink-0 p-1.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${name} logo`}
        width={36}
        height={36}
        className="max-w-full max-h-full object-contain"
        loading="lazy"
        onError={() => {
          if (src.endsWith('.svg')) setSrc(`/images/ehr/${slug}.png`);
          else setFailed(true);
        }}
      />
    </div>
  );
}
