import { Button } from '@zproo/ui';
import { SlidersHorizontal } from 'lucide-react';
import {
  ALL_AMENITIES,
  LOCATION_TAG_LABEL,
  MEAL_PLAN_SHORT,
  PROPERTY_TYPES,
  type LocationTag,
  type MealPlan,
} from '../data';
import {
  DEFAULT_FILTERS,
  activeFilters,
  toggle,
  type GuestRatingMin,
  type HotelFilters,
} from '../filters';

interface Props {
  filters: HotelFilters;
  onChange: (next: HotelFilters) => void;
  bounds: { min: number; max: number };
  /** Location tags that exist in the current destination (hides filters that can never match). */
  locations: readonly LocationTag[];
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <fieldset className="border-t border-border pt-4">
    <legend className="mb-2 text-sm font-extrabold">{title}</legend>
    <div className="space-y-2">{children}</div>
  </fieldset>
);

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="size-4 accent-[var(--primary)]" />
      {label}
    </label>
  );
}

const MEALS: readonly MealPlan[] = ['ROOM_ONLY', 'BREAKFAST', 'HALF_BOARD', 'FULL_BOARD'];

export function FilterPanel({ filters, onChange, bounds, locations }: Props) {
  const set = (patch: Partial<HotelFilters>) => onChange({ ...filters, ...patch });
  const count = activeFilters(filters).length;
  const maxRupees = filters.maxPricePaise !== null ? filters.maxPricePaise / 100 : bounds.max;
  const minRupees = filters.minPricePaise !== null ? filters.minPricePaise / 100 : '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-extrabold">
          <SlidersHorizontal aria-hidden className="size-4" /> Filters
        </h2>
        {count > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(DEFAULT_FILTERS)}>
            Clear all
          </Button>
        )}
      </div>

      <Section title="Price per night">
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs font-semibold text-muted">
            Minimum (₹)
            <input
              type="number"
              min={0}
              step={500}
              inputMode="numeric"
              aria-label="Minimum price per night"
              value={minRupees}
              placeholder={String(bounds.min)}
              onChange={(e) => set({ minPricePaise: e.target.value === '' ? null : Math.max(0, Number(e.target.value)) * 100 })}
              className="mt-1 w-full rounded-lg border border-border bg-background p-2 text-sm font-normal text-foreground"
            />
          </label>
          <label className="text-xs font-semibold text-muted">
            Maximum (₹)
            <input
              type="number"
              min={0}
              step={500}
              inputMode="numeric"
              aria-label="Maximum price per night"
              value={filters.maxPricePaise !== null ? maxRupees : ''}
              placeholder={String(bounds.max)}
              onChange={(e) => set({ maxPricePaise: e.target.value === '' ? null : Math.max(0, Number(e.target.value)) * 100 })}
              className="mt-1 w-full rounded-lg border border-border bg-background p-2 text-sm font-normal text-foreground"
            />
          </label>
        </div>
        <input
          type="range"
          aria-label="Price slider"
          min={bounds.min}
          max={bounds.max}
          step={500}
          value={Math.min(bounds.max, Math.max(bounds.min, maxRupees))}
          onChange={(e) => {
            const v = Number(e.target.value);
            set({ maxPricePaise: v >= bounds.max ? null : v * 100 });
          }}
          className="w-full"
        />
        <p className="text-xs text-muted">Up to ₹{maxRupees.toLocaleString('en-IN')} a night, before taxes</p>
      </Section>

      <Section title="Star rating">
        {[5, 4, 3, 2, 1].map((s) => (
          <Check key={s} label={`${s} star`} checked={filters.stars.includes(s)} onChange={() => set({ stars: toggle(filters.stars, s) })} />
        ))}
      </Section>

      <Section title="Guest rating">
        {([8, 7, 6] as GuestRatingMin[]).map((r) => (
          <label key={r} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="guest-rating"
              checked={filters.guestRatingMin === r}
              onChange={() => set({ guestRatingMin: r })}
              className="size-4 accent-[var(--primary)]"
            />
            {r}+ guest rating
          </label>
        ))}
        <button type="button" onClick={() => set({ guestRatingMin: null })} className="text-xs font-semibold text-primary hover:underline">
          Any rating
        </button>
      </Section>

      <Section title="Property type">
        {PROPERTY_TYPES.map((t) => (
          <Check key={t} label={t} checked={filters.propertyTypes.includes(t)} onChange={() => set({ propertyTypes: toggle(filters.propertyTypes, t) })} />
        ))}
      </Section>

      <Section title="Amenities">
        {ALL_AMENITIES.map((a) => (
          <Check
            key={a}
            label={a === 'AC' ? 'Air conditioning' : a === 'Pool' ? 'Swimming pool' : a}
            checked={filters.amenities.includes(a)}
            onChange={() => set({ amenities: toggle(filters.amenities, a) })}
          />
        ))}
      </Section>

      <Section title="Booking policies">
        <Check label="Free cancellation" checked={filters.freeCancellation} onChange={() => set({ freeCancellation: !filters.freeCancellation })} />
        <Check label="Pay at property" checked={filters.payAtProperty} onChange={() => set({ payAtProperty: !filters.payAtProperty })} />
        <Check label="No prepayment" checked={filters.noPrepayment} onChange={() => set({ noPrepayment: !filters.noPrepayment })} />
      </Section>

      <Section title="Meal plans">
        {MEALS.map((m) => (
          <label key={m} className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="radio" name="meal-plan" checked={filters.mealPlan === m} onChange={() => set({ mealPlan: m })} className="size-4 accent-[var(--primary)]" />
            {MEAL_PLAN_SHORT[m]}
          </label>
        ))}
        <button type="button" onClick={() => set({ mealPlan: null })} className="text-xs font-semibold text-primary hover:underline">
          Any meal plan
        </button>
      </Section>

      {locations.length > 0 && (
        <Section title="Location">
          {locations.map((l) => (
            <Check key={l} label={LOCATION_TAG_LABEL[l]} checked={filters.locations.includes(l)} onChange={() => set({ locations: toggle(filters.locations, l) })} />
          ))}
        </Section>
      )}
    </div>
  );
}
