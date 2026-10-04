import { Check, Copy, Tag } from 'lucide-react';
import { useState } from 'react';

type Offer = {
  id: number;
  title: string;
  code: string;
  description: string;
};

const OFFERS: Offer[] = [
  {
    id: 1,
    title: '10% OFF',
    code: 'ZPROO10',
    description: 'App promotion on eligible bus bookings.',
  },
  {
    id: 2,
    title: '₹100 OFF',
    code: 'BUS100',
    description: 'Get ₹100 off on eligible bus bookings.',
  },
  {
    id: 3,
    title: '₹500 OFF',
    code: 'WELCOME500',
    description: 'First-booking promotion where eligible.',
  },
  {
    id: 4,
    title: '15% OFF',
    code: 'TRAVEL15',
    description: 'Save 15% on selected intercity bus routes.',
  },
  {
    id: 5,
    title: '₹200 OFF',
    code: 'BUS200',
    description: 'Enjoy ₹200 off on qualifying bus bookings.',
  },
  {
    id: 6,
    title: '₹300 OFF',
    code: 'SAVE300',
    description: 'Special savings on selected bus journeys.',
  },
  {
    id: 7,
    title: '20% OFF',
    code: 'ZPROO20',
    description: 'Get 20% off on eligible ZPROO bus bookings.',
  },
  {
    id: 8,
    title: '₹150 OFF',
    code: 'RIDE150',
    description: 'Save ₹150 on selected bus reservations.',
  },
  {
    id: 9,
    title: '₹250 OFF',
    code: 'BUS250',
    description: 'Limited-time discount on eligible routes.',
  },
  {
    id: 10,
    title: '12% OFF',
    code: 'TRIP12',
    description: 'Get 12% off on selected intercity trips.',
  },
  {
    id: 11,
    title: '₹400 OFF',
    code: 'SAVE400',
    description: 'Enjoy ₹400 savings on qualifying bookings.',
  },
  {
    id: 12,
    title: '25% OFF',
    code: 'ZPROO25',
    description: 'Big savings on selected ZPROO bus bookings.',
  },
];

export default function OffersPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);

      window.setTimeout(() => {
        setCopiedCode(null);
      }, 2500);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f9fc]">
      {/* Page Content */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#071a33] sm:text-4xl">
            Offers & discounts
          </h1>

          <p className="mt-2 text-base text-[#64748b]">
            Browse available bus promotions and copy a coupon before booking.
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {OFFERS.map((offer) => (
            <article
              key={offer.id}
              className="
                group
                overflow-hidden
                rounded-2xl
                border
                border-[#e2e8f0]
                bg-white
                shadow-[0_4px_14px_rgba(15,23,42,0.08)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-[0_14px_30px_rgba(15,23,42,0.13)]
              "
            >
              {/* Red Offer Header */}
              <div
                className="
                  relative
                  overflow-hidden
                  bg-[#e50920]
                  px-5
                  py-5
                  text-white
                "
              >
                {/* Shine */}
                <span
                  className="
                    pointer-events-none
                    absolute
                    -left-24
                    top-0
                    h-full
                    w-20
                    rotate-12
                    bg-white/20
                    blur-sm
                    transition-all
                    duration-700
                    group-hover:left-[120%]
                  "
                />

                <Tag
                  aria-hidden
                  className="relative size-6"
                  strokeWidth={2}
                />

                <h2
                  className="
                    relative
                    mt-3
                    text-2xl
                    font-extrabold
                    tracking-tight
                  "
                >
                  {offer.title}
                </h2>
              </div>

              {/* Card Body */}
              <div className="p-5">
                {/* Badge */}
                <span
                  className="
                    inline-flex
                    rounded-full
                    bg-red-50
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    text-[#e50920]
                  "
                >
                  Bus offer
                </span>

                {/* Coupon */}
                <h3
                  className="
                    mt-4
                    text-base
                    font-extrabold
                    tracking-wide
                    text-[#071a33]
                  "
                >
                  {offer.code}
                </h3>

                {/* Description */}
                <p className="mt-1 min-h-[44px] text-sm leading-6 text-[#64748b]">
                  {offer.description}
                </p>

                {/* Copy Button */}
                <button
                  type="button"
                  onClick={() => {
                    void copyCode(offer.code);
                  }}
                  className="
                    mt-4
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    border
                    border-[#e2e8f0]
                    bg-white
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-[#071a33]
                    transition-all
                    duration-200
                    hover:border-[#e50920]
                    hover:bg-red-50
                    hover:text-[#e50920]
                    active:scale-[0.98]
                  "
                >
                  {copiedCode === offer.code ? (
                    <>
                      <Check className="size-4 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" />
                      Copy code
                    </>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Terms */}
        <section
          className="
            mt-8
            rounded-2xl
            border
            border-[#e2e8f0]
            bg-white
            p-5
            shadow-[0_4px_14px_rgba(15,23,42,0.06)]
            sm:p-6
          "
        >
          <h2 className="text-lg font-bold text-[#071a33]">
            Terms
          </h2>

          <p className="mt-4 text-sm leading-6 text-[#64748b]">
            Offers are subject to eligibility, validity, route/operator
            restrictions and the final fare returned by the booking service.
          </p>
        </section>
      </section>

      {/* Copy Notification */}
      {copiedCode && (
        <div
          className="
            fixed
            right-5
            top-5
            z-[9999]
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-green-200
            bg-white
            px-4
            py-3
            shadow-[0_12px_35px_rgba(0,0,0,0.16)]
            animate-[offerToastIn_0.3s_ease-out]
          "
          role="status"
          aria-live="polite"
        >
          <span
            className="
              grid
              size-9
              place-items-center
              rounded-full
              bg-green-100
              text-green-600
            "
          >
            <Check className="size-5" />
          </span>

          <div>
            <p className="text-sm font-bold text-[#071a33]">
              Coupon copied!
            </p>

            <p className="text-xs text-[#64748b]">
              {copiedCode} copied to clipboard
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes offerToastIn {
          from {
            opacity: 0;
            transform: translateX(30px) scale(0.95);
          }

          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </main>
  );
}