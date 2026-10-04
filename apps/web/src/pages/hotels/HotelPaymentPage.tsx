import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@zproo/ui';
import { CheckCircle2, CreditCard, Landmark, Loader2, Lock, ShieldCheck, Smartphone } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { Seo } from '@/components/seo/Seo';
import { useAuthStore } from '@/features/auth/store';
import { buildBooking, generateReference, verifyPayment } from '@/features/hotels/booking';
import { HotelSteps } from '@/features/hotels/components/HotelSteps';
import { PriceBox } from '@/features/hotels/components/PriceBox';
import { formatINR, nightsBetween } from '@/features/hotels/data';
import { hotelConfirmationUrl } from '@/features/hotels/links';
import { useHotelNotifications } from '@/features/hotels/notifications';
import { priceStay } from '@/features/hotels/pricing';
import { useHotelBooking } from '@/features/hotels/store';
import { BANKS, validatePayment, type PaymentInput, type PaymentMethod } from '@/features/hotels/validation';

const METHODS = [
  ['upi', 'UPI', Smartphone],
  ['card', 'Card', CreditCard],
  ['netbanking', 'Net banking', Landmark],
] as const;

export default function HotelPaymentPage() {
  const navigate = useNavigate();
  const state = useHotelBooking();
  const user = useAuthStore((s) => s.user);
  const { hotel, room, contact, checkIn, checkOut, rooms, adults, children, childAges, guests, coupon } = state;
  const [method, setMethod] = useState<PaymentMethod>(state.paymentMethod);
  const [upi, setUpi] = useState('');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' });
  const [bank, setBank] = useState('');
  const [error, setError] = useState('');
  const [phase, setPhase] = useState<'idle' | 'verifying'>('idle');
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  if (!hotel || !room || !contact) return <Navigate to="/hotels" replace />;
  if (guests.length === 0) return <Navigate to="/hotels/booking" replace />;

  const nights = nightsBetween(checkIn, checkOut);
  const price = priceStay(room, nights, rooms, coupon);
  const payLater = room.payAtProperty;

  const pay = (e: FormEvent) => {
    e.preventDefault();
    if (phase === 'verifying') return;
    setError('');
    const input: PaymentInput = { method, upi, card, bank };
    if (!payLater) {
      const problem = validatePayment(input);
      if (problem) return setError(problem);
    }
    setPhase('verifying');
    state.setPaymentMethod(method);
    // Simulated gateway round-trip, then server-side style verification of the result.
    timer.current = window.setTimeout(() => {
      const outcome = payLater ? ({ status: 'SUCCESS', transactionId: 'PAY-AT-PROPERTY' } as const) : verifyPayment(input, price.totalPaise);
      if (outcome.status === 'FAILED') {
        setPhase('idle');
        setError(outcome.message);
        return;
      }
      const booking = buildBooking(
        { hotel, room, checkIn, checkOut, nights, rooms, adults, children, childAges, guests, contact, specialRequests: state.specialRequests, specialNote: state.specialNote, coupon, method },
        generateReference(),
        outcome.transactionId,
      );
      state.complete(booking);
      // Push the confirmed booking to the notification bell (same as bus and flight bookings).
      if (user) {
        useHotelNotifications.getState().add({
          reference: booking.reference,
          userId: String(user.id),
          hotelName: booking.hotelName,
          city: booking.city,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          createdAt: booking.paidAt,
        });
      }
      void navigate(hotelConfirmationUrl(booking.reference), { replace: true });
    }, 600);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <Seo title="Hotel payment" noIndex />
      <HotelSteps current={3} />
      <form onSubmit={pay} noValidate className="grid gap-6 lg:grid-cols-[1fr_21rem]">
        <main className="space-y-5">
          <div><h1 className="text-3xl font-extrabold">Secure payment</h1><p className="mt-1 text-sm text-muted">Payment is simulated in this development environment. No real charge is made.</p></div>
          {payLater ? (
            <Card><CardContent className="flex gap-3 p-5 text-sm"><ShieldCheck aria-hidden className="size-5 shrink-0 text-primary" /><p><strong>Pay at property.</strong> Nothing is charged now. You will pay {formatINR(price.totalPaise)} at the hotel when you check in.</p></CardContent></Card>
          ) : (
            <Card><CardHeader><CardTitle className="text-base">Payment method</CardTitle></CardHeader><CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {METHODS.map(([id, label, Icon]) => (
                  <button type="button" key={id} onClick={() => { setMethod(id); setError(''); }} aria-pressed={method === id} className={`rounded-xl border p-4 text-left ${method === id ? 'border-primary bg-primary-light' : 'border-border'}`}>
                    <Icon aria-hidden className="size-5 text-primary" /><span className="mt-2 block text-sm font-bold">{label}</span>
                  </button>
                ))}
              </div>
              {method === 'upi' && <div className="mt-5"><Label htmlFor="upi">UPI ID</Label><Input id="upi" value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="name@upi" className="mt-1" autoComplete="off" /></div>}
              {method === 'card' && (
                <div className="mt-5 grid gap-3">
                  <div><Label htmlFor="card-number">Card number</Label><Input id="card-number" inputMode="numeric" autoComplete="off" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value.replace(/[^\d\s]/g, '') })} placeholder="1234 5678 9012 3456" className="mt-1" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label htmlFor="expiry">Expiry</Label><Input id="expiry" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="MM/YY" className="mt-1" autoComplete="off" /></div>
                    <div><Label htmlFor="cvv">CVV</Label><Input id="cvv" type="password" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '') })} placeholder="123" className="mt-1" autoComplete="off" /></div>
                  </div>
                </div>
              )}
              {method === 'netbanking' && (
                <div className="mt-5"><Label htmlFor="bank">Select your bank</Label>
                  <select id="bank" value={bank} onChange={(e) => setBank(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-2 text-sm"><option value="">Choose bank</option>{BANKS.map((b) => <option key={b} value={b}>{b}</option>)}</select>
                  <p className="mt-2 text-xs text-muted">You will be redirected to your bank in a production payment gateway.</p></div>
              )}
            </CardContent></Card>
          )}
          {error && <p role="alert" className="rounded-xl border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</p>}
          {phase === 'verifying' && <p role="status" className="flex items-center gap-2 text-sm font-semibold text-primary"><Loader2 aria-hidden className="size-4 animate-spin" /> Verifying your payment. Please do not close this page.</p>}
          <p className="flex items-center gap-2 text-xs text-muted"><Lock aria-hidden className="size-3.5" /> Card details are validated here and never stored by this demo flow. Test tip: a card ending 0002 or UPI starting fail@ is declined.</p>
        </main>
        <aside className="h-fit space-y-4 rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24">
          <div><p className="text-sm text-muted">{hotel.name}</p><p className="mt-1 font-bold">{room.name}</p></div>
          <PriceBox price={price} payAtProperty={payLater} />
          <Button type="submit" size="lg" className="w-full" disabled={phase === 'verifying'}>
            {phase === 'verifying' ? 'Processing…' : payLater ? 'Confirm booking' : `Pay ${formatINR(price.totalPaise)}`} <CheckCircle2 aria-hidden />
          </Button>
        </aside>
      </form>
    </div>
  );
}
