import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const footerLinks = {
  shop: [
    { name: 'New Season', href: '/collection/new-season' },
    { name: 'Atasan', href: '/category/atasan' },
    { name: 'Bawahan', href: '/category/bawahan' },
    { name: 'Outer', href: '/category/outer' },
    { name: 'Dress', href: '/category/dress' },
    { name: 'Sale', href: '/sale' },
  ],
  help: [
    { name: 'FAQ', href: '/faq' },
    { name: 'Shipping', href: '/shipping' },
    { name: 'Returns', href: '/returns' },
    { name: 'Size Guide', href: '/size-guide' },
    { name: 'Contact Us', href: '/contact' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Store Locations', href: '/stores' },
    { name: 'Sustainability', href: '/sustainability' },
  ],
  legal: [
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
};

const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com', icon: Instagram },
  { name: 'Facebook', href: 'https://facebook.com', icon: Facebook },
  { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
  { name: 'Youtube', href: 'https://youtube.com', icon: Youtube },
];

const paymentMethods = [
  { name: 'Visa', code: 'visa' },
  { name: 'Mastercard', code: 'mastercard' },
  { name: 'BCA', code: 'bca' },
  { name: 'Mandiri', code: 'mandiri' },
  { name: 'GoPay', code: 'gopay' },
  { name: 'OVO', code: 'ovo' },
];

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
            <div className="text-center lg:text-left">
              <h3 className="font-serif text-2xl font-semibold">Join Our Newsletter</h3>
              <p className="mt-2 text-sm text-white/70">
                Subscribe to get special offers, free giveaways, and exclusive deals.
              </p>
            </div>
            <form className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-white focus:outline-none"
              />
              <button
                type="submit"
                className="bg-white px-6 py-3 text-sm font-medium text-navy-900 transition-colors hover:bg-cream-100"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="font-serif text-2xl font-semibold tracking-tight">
              D&apos;commerce
            </Link>
            <p className="mt-4 max-w-xs text-sm text-white/70">
              Premium Indonesian fashion brand offering timeless elegance for modern lifestyle.
            </p>
            {/* Social Links */}
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 transition-colors hover:text-white"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">Shop</h4>
            <ul className="mt-4 space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">Help</h4>
            <ul className="mt-4 space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">Company</h4>
            <ul className="mt-4 space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">Legal</h4>
            <ul className="mt-4 space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="text-sm text-white/70">Accepted Payment:</span>
              {paymentMethods.map((method) => (
                <div
                  key={method.code}
                  className="border border-white/30 px-3 py-1.5 text-xs font-medium"
                >
                  {method.name}
                </div>
              ))}
            </div>
            <p className="text-xs text-white/50">
              &copy; {new Date().getFullYear()} D&apos;commerce. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
