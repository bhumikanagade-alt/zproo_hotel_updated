import { Check, Copy, TicketPercent } from 'lucide-react';
import { useEffect, useState } from 'react';
import { OFFERS } from '../content';
import { Section, SectionHeader } from './SectionHeader';

function CopyCode({
  code,
  onCopied,
}: {
  code: string;
  onCopied: (code: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);

      setCopied(true);
      onCopied(code);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <button
      type="button"
      onClick={() => {
        void handleCopy();
      }}
      className="
        flex items-center gap-2
        rounded-xl
        border-2 border-dashed border-primary/40
        bg-primary-light/60
        px-3 py-1.5
        font-mono text-sm font-bold
        tracking-wider text-primary
        transition-all duration-200
        hover:border-primary
        hover:bg-primary-light
        hover:shadow-sm
        active:scale-[0.97]
      "
      aria-label={copied ? `${code} copied` : `Copy code ${code}`}
    >
      {code}

      {copied ? (
        <Check aria-hidden className="size-4" />
      ) : (
        <Copy aria-hidden className="size-4" />
      )}
    </button>
  );
}

export function OffersSection() {
  const [copiedCode, setCopiedCode] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  /*
   * Hide copy notification automatically.
   */
  useEffect(() => {
    if (!showNotification) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowNotification(false);
      setCopiedCode('');
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [showNotification]);

  /*
   * Called when a coupon is copied.
   */
  const handleCopied = (code: string) => {
    setCopiedCode(code);
    setShowNotification(true);
  };

  /*
   * Duplicate the offers so the carousel can
   * continuously move without an empty space.
   */
  const movingOffers = [...OFFERS, ...OFFERS];

  return (
    <>
      {/* =====================================================
          COPY NOTIFICATION
      ===================================================== */}
      {showNotification && (
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
            animate-[offerToastIn_0.35s_ease-out]
          "
          role="status"
          aria-live="polite"
        >
          <span
            className="
              grid
              size-9
              shrink-0
              place-items-center
              rounded-full
              bg-green-100
              text-green-600
            "
          >
            <Check className="size-5" />
          </span>

          <div>
            <p className="text-sm font-bold text-foreground">
              Coupon copied!
            </p>

            <p className="text-xs text-muted">
              {copiedCode} copied to clipboard
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          OFFERS SECTION
      ===================================================== */}
      <Section id="offers-title">
        <SectionHeader
          id="offers-title"
          title="Offers for you"
          subtitle="Apply the code at checkout. T&Cs apply."
          action={{
            to: '/offers',
            label: 'All offers',
          }}
        />

        {/* ===================================================
            MOVING OFFERS AREA
        =================================================== */}
        <div
          className="
            relative
            mt-5
            overflow-hidden
            py-3
          "
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* LEFT FADE */}
          <div
            className="
              pointer-events-none
              absolute
              inset-y-0
              left-0
              z-20
              w-10
              bg-gradient-to-r
              from-background
              via-background/70
              to-transparent
              sm:w-16
            "
          />

          {/* RIGHT FADE */}
          <div
            className="
              pointer-events-none
              absolute
              inset-y-0
              right-0
              z-20
              w-10
              bg-gradient-to-l
              from-background
              via-background/70
              to-transparent
              sm:w-16
            "
          />

          {/* =================================================
              CAROUSEL TRACK
          ================================================= */}
          <ul
            className="offers-carousel-track"
            style={{
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          >
            {movingOffers.map((offer, index) => (
              <li
                key={`${offer.code}-${index}`}
                className="offers-carousel-card"
              >
                {/* =================================================
                    OFFER CARD
                ================================================= */}
                <article
                  className="
                    offer-shine-card
                    relative
                    flex
                    h-full
                    min-h-[185px]
                    flex-col
                    overflow-hidden
                    rounded-card
                    border
                    border-border
                    bg-card
                    p-5
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:scale-[1.015]
                    hover:shadow-lg
                  "
                >
                  {/* LEFT TICKET NOTCH */}
                  <span
                    aria-hidden
                    className="
                      absolute
                      -left-3
                      top-1/2
                      size-6
                      -translate-y-1/2
                      rounded-full
                      bg-background
                      ring-1
                      ring-border
                    "
                  />

                  {/* RIGHT TICKET NOTCH */}
                  <span
                    aria-hidden
                    className="
                      absolute
                      -right-3
                      top-1/2
                      size-6
                      -translate-y-1/2
                      rounded-full
                      bg-background
                      ring-1
                      ring-border
                    "
                  />

                  {/* =================================================
                      SERVICE
                  ================================================= */}
                  <p
                    className="
                      flex
                      items-center
                      gap-1.5
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-muted
                    "
                  >
                    <TicketPercent
                      aria-hidden
                      className="size-4 text-primary"
                    />

                    {offer.service}
                  </p>

                  {/* =================================================
                      TITLE
                  ================================================= */}
                  <h3
                    className="
                      mt-2
                      text-lg
                      font-extrabold
                      leading-snug
                    "
                  >
                    {offer.title}
                  </h3>

                  {/* =================================================
                      DETAILS
                  ================================================= */}
                  <p
                    className="
                      mt-1
                      flex-1
                      text-sm
                      text-muted
                    "
                  >
                    {offer.detail}
                  </p>

                  {/* =================================================
                      COPY CODE
                  ================================================= */}
                  <div className="mt-4">
                    <CopyCode
                      code={offer.code}
                      onCopied={handleCopied}
                    />
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* =====================================================
          ANIMATIONS
      ===================================================== */}
      <style>{`
        /* =====================================================
           CONTINUOUS CAROUSEL
        ===================================================== */

        @keyframes offersCarouselMove {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(
              calc(-50% - 10px)
            );
          }
        }


        /* =====================================================
           COPY NOTIFICATION
        ===================================================== */

        @keyframes offerToastIn {
          0% {
            opacity: 0;
            transform: translateX(35px) scale(0.95);
          }

          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }


        /* =====================================================
           CAROUSEL TRACK
        ===================================================== */

        .offers-carousel-track {
          display: flex;
          width: max-content;
          gap: 20px;

          margin: 0;
          padding: 0;

          list-style: none;

          animation:
            offersCarouselMove
            24s
            linear
            infinite;

          will-change: transform;
        }


        /* =====================================================
           CARD CONTAINER
        ===================================================== */

        .offers-carousel-card {
          width: 280px;
          flex: 0 0 280px;

          filter: blur(0.2px);
          opacity: 0.96;

          transition:
            filter 250ms ease,
            opacity 250ms ease,
            transform 250ms ease;
        }


        /* =====================================================
           CARD HOVER
        ===================================================== */

        .offers-carousel-card:hover {
          filter: blur(0);
          opacity: 1;
        }


        /* =====================================================
           SHINE CARD
        ===================================================== */

        .offer-shine-card {
          position: relative;
          isolation: isolate;
        }


        /* =====================================================
           MOVING WHITE SHINE
        ===================================================== */

        .offer-shine-card::before {
          content: '';

          position: absolute;

          top: -80%;
          left: -100%;

          width: 60%;
          height: 260%;

          background: linear-gradient(
            105deg,
            transparent 0%,
            transparent 35%,
            rgba(255, 255, 255, 0.08) 45%,
            rgba(255, 255, 255, 0.65) 50%,
            rgba(255, 255, 255, 0.08) 55%,
            transparent 65%,
            transparent 100%
          );

          transform: rotate(15deg);

          animation:
            offerCardShine
            4s
            ease-in-out
            infinite;

          pointer-events: none;

          z-index: 5;
        }


        /* =====================================================
           ANIMATED BORDER GLOW
        ===================================================== */

        .offer-shine-card::after {
          content: '';

          position: absolute;

          inset: 0;

          border-radius: inherit;

          background: linear-gradient(
            120deg,
            transparent 20%,
            rgba(59, 130, 246, 0.18) 40%,
            rgba(16, 185, 129, 0.28) 50%,
            rgba(234, 179, 8, 0.18) 60%,
            transparent 80%
          );

          background-size: 250% 250%;

          animation:
            offerBorderGlow
            5s
            linear
            infinite;

          pointer-events: none;

          z-index: -1;
        }


        /* =====================================================
           SHINE MOVEMENT
        ===================================================== */

        @keyframes offerCardShine {
          0% {
            left: -100%;
            opacity: 0;
          }

          15% {
            opacity: 1;
          }

          50% {
            left: 130%;
            opacity: 1;
          }

          65% {
            opacity: 0;
          }

          100% {
            left: 130%;
            opacity: 0;
          }
        }


        /* =====================================================
           BORDER GLOW MOVEMENT
        ===================================================== */

        @keyframes offerBorderGlow {
          0% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }

          100% {
            background-position: 0% 50%;
          }
        }


        /* =====================================================
           HOVER SHINE
        ===================================================== */

        .offer-shine-card:hover::before {
          animation-duration: 2.5s;
        }

        .offer-shine-card:hover::after {
          animation-duration: 3s;
        }


        /* =====================================================
           TABLET / DESKTOP
        ===================================================== */

        @media (min-width: 640px) {
          .offers-carousel-card {
            width: 310px;
            flex-basis: 310px;
          }
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 639px) {
          .offers-carousel-track {
            gap: 14px;
          }

          .offers-carousel-card {
            width: 270px;
            flex-basis: 270px;
          }
        }


        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {
          .offers-carousel-track {
            animation: none;
          }

          .offers-carousel-card {
            filter: none;
          }

          .offer-shine-card::before,
          .offer-shine-card::after {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}