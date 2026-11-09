import Link from 'next/link';
import BrandMark from '../ui/BrandMark';

const explore = [
  { label: 'Courses', href: '/courses' },
  { label: 'The platform', href: '/about' },
  { label: 'Journal', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export default function Footer() {
  return (
    <footer className="bg-[#103629] text-[#e5efe7]">
      <div className="ih-container pt-16 pb-8">
        <div className="grid gap-12 lg:grid-cols-[1.65fr_1fr_1fr] pb-16">
          <div>
            <BrandMark inverse />
            <p className="mt-6 max-w-sm text-sm leading-7 text-[#b8cec0]">Thoughtful learning experiences for people and institutions. Built to make teaching, learning and progress feel simpler.</p>
            <div className="mt-7"><Link href="/contact" className="ih-btn ih-btn-lime">Talk to us <span aria-hidden="true">↗</span></Link></div>
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-[.18em] text-[#9ab5a5] font-bold">Explore</h2>
            <ul className="mt-5 space-y-3">{explore.map(item => <li key={item.href}><Link href={item.href} className="text-sm hover:text-[#d8f59d] transition-colors">{item.label}</Link></li>)}</ul>
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-[.18em] text-[#9ab5a5] font-bold">For your learning journey</h2>
            <ul className="mt-5 space-y-3">
              <li><Link href="/dashboard" className="text-sm hover:text-[#d8f59d]">My workspace</Link></li>
              <li><Link href="/certificates" className="text-sm hover:text-[#d8f59d]">Certificates</Link></li>
              <li><Link href="/profile" className="text-sm hover:text-[#d8f59d]">Account settings</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/15 pt-7 flex flex-wrap gap-3 justify-between items-center">
          <p className="text-xs text-[#a8c2b0]">© {new Date().getFullYear()} iremehub+. All rights reserved.</p>
          <p className="text-xs text-[#a8c2b0]">Learning, designed with care.</p>
        </div>
      </div>
    </footer>
  );
}
