import { Link } from 'react-router';

interface FooterLink {
  label: string;
  /** Full route. Bus, train and hotel links open the app's own pages. */
  to: string;
}

const BOOK: FooterLink[] = [
  { label: 'Bus tickets', to: '/buses' },
  { label: 'Train tickets', to: '/trains' },
  { label: 'Hotels', to: '/hotels' },
  { label: 'PNR status', to: '/info/pnr-status' },
  { label: 'Live train status', to: '/info/live-train-status' },
];

const HELP: FooterLink[] = [
  { label: 'Blogs', to: '/blog' },
  { label: 'Cancel booking', to: '/info/cancel-booking' },
  { label: 'Refund status', to: '/info/refund-status' },
  { label: 'FAQs', to: '/info/faqs' },
];

const COMPANY: FooterLink[] = [
  { label: 'About ZPROO', to: '/info/about' },
  { label: 'Corporate travel', to: '/info/corporate-travel' },
  { label: 'Careers', to: '/info/careers' },
  { label: 'Terms & privacy', to: '/info/terms-privacy' },
];

function FooterColumn({ title, items }: { title: string; items: FooterLink[] }) {
  return (
    <div className="min-w-0">
      <h3 className="mb-4 text-[18px] font-bold leading-none text-white">{title}</h3>
      <ul className="space-y-3.5">
        {items.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className="text-[16px] font-normal leading-[1.2] text-[#d0cbcb] transition-opacity duration-200 hover:opacity-75"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative w-full overflow-hidden border-b border-[#444444] bg-[#080808] pb-(--bottom-nav-height) text-white md:pb-0">
      <div className="mx-auto w-full max-w-[2048px] px-[7.8%] pt-[28px] pb-[35px]">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.35fr_1fr_1fr_1fr] md:gap-8 lg:gap-12">
          {/* Brand */}
          <div className="min-w-0">
            <Link to="/" className="flex items-start">
              <img
                src="/assets/brand/zproo-footer-logo.png"
                alt="zproo go"
                className="h-auto w-[215px] max-w-full object-contain"
              />
            </Link>
            <p className="mt-2 text-[18px] font-normal leading-[1.3] text-[#c9c3c3]">
              Travel smarter. Go further.
            </p>
          </div>

          <FooterColumn title="Book" items={BOOK} />
          <FooterColumn title="Help" items={HELP} />
          <FooterColumn title="Company" items={COMPANY} />
        </div>

        <div className="mt-[38px]">
          <p className="text-[17px] font-normal tracking-[-0.01em] text-white">
            ZPROO GO · Web booking design
          </p>
        </div>
      </div>
    </footer>
  );
}
