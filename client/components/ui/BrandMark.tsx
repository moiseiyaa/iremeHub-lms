import Link from 'next/link';

interface BrandMarkProps { inverse?: boolean; compact?: boolean; href?: string; }

export default function BrandMark({ inverse = false, compact = false, href = '/' }: BrandMarkProps) {
  return (
    <Link href={href} className={`ih-brand ${inverse ? 'ih-brand-light' : ''}`} aria-label="iremehub+ home">
      <span className="ih-brand-icon" aria-hidden="true">i<span className="text-xs relative -top-1">+</span></span>
      {!compact && <span>iremehub<span className="ih-brand-plus">+</span></span>}
    </Link>
  );
}
