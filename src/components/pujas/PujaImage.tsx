'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface PujaImageProps {
  subPurpose: string;
  altText: string;
  className?: string;
}

const DEFAULT_LOCAL_FALLBACK_IMAGE_PATH = '/images/pujas/default.png';

export default function PujaImage({ subPurpose, altText, className }: PujaImageProps) {
  const generateSrc = () => {
    return subPurpose
      ? `/images/pujas/${subPurpose.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}.png`
      : DEFAULT_LOCAL_FALLBACK_IMAGE_PATH;
  };

  const [imageSrc, setImageSrc] = useState(generateSrc());

  useEffect(() => {
    setImageSrc(generateSrc());
  }, [subPurpose]);

  const handleError = () => {
    if (imageSrc !== DEFAULT_LOCAL_FALLBACK_IMAGE_PATH) {
      setImageSrc(DEFAULT_LOCAL_FALLBACK_IMAGE_PATH);
    }
  };
  
  const imageHint = subPurpose ? subPurpose.split(' ').slice(0, 2).join(' ') : 'spiritual event';

  return (
    <Image
      src={imageSrc}
      alt={altText}
      width={600}
      height={400}
      className={className}
      onError={handleError}
      data-ai-hint={imageHint}
    />
  );
}
