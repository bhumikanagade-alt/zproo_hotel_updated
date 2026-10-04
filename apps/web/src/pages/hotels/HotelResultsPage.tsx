import { Button } from '@zproo/ui';
import { SearchX, SlidersHorizontal, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Seo } from '@/components/seo/Seo';
import { HOTEL_DATA, type LocationTag } from '@/features/hotels/data';
import { FilterPanel } from '@/features/hotels/components/FilterPanel';
import { HotelCard } from '@/features/hotels/components/HotelCard';
import { formatDate } from '@/features/hotels/dates';
import {
  DEFAULT_FILTERS,
  SORT_OPTIONS,
  activeFilters,
  isHotelSort,
  priceBounds,
  removeFilter,
  searchHotels,
  type HotelFilters,
  type HotelSort,
} from '@/features/hotels/filters';
import { guestsLabel } from '@/features/hotels/occupancy';
import { parseHotelSearch, stayQuery } from '@/features/hotels/search';
import { matchesDestination, destinationLabel } from '@/features/hotels/suggest';
import { useHotelBooking } from '@/features/hotels/store';

export default function HotelResultsPage() {
  const [params] = useSearchParams();
  const search = useMemo(() => parseHotelSearch(params), [params]);
  const [filters, setFilters] = useState<HotelFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<HotelSort>('recommended');
  const [showFilters, setShowFilters] = useState(false);
  const setSearch = useHotelBooking((s) => s.setSearch);

  const bounds = useMemo(() => priceBounds(), []);
  const outcome = useMemo(
    () => searchHotels({ query: search.query, nights: search.nights, occupancy: search.occupancy }, filters, sort),
    [search, filters, sort],
  );
  const locations = useMemo(() => {
    const tags = new Set<LocationTag>();
    for (const h of HOTEL_DATA) if (matchesDestination(h, search.query)) h.locationTags.forEach((t) => tags.add(t));
    return [...tags];
  }, [search.query]);

  const label = destinationLabel(search.query);
  const chips = activeFilters(filters);
  const query = stayQuery(search);
  const remember = () =>
    setSearch({
      city: label,
      checkIn: search.checkIn,
      checkOut: search.checkOut,
      rooms: search.rooms,
      adults: search.adults,
      children: search.children,
      childAges: search.childAges,
    });

  const { results } = outcome;
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Seo title={`Hotels in ${label}`} noIndex />
      <div className="mb-5 rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Hotels</p>
        <h1 className="mt-1 text-2xl font-extrabold">
          {results.length} stay{results.length === 1 ? '' : 's'} in {label}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {formatDate(search.checkIn)} → {formatDate(search.checkOut)} · {search.nights} night{search.nights === 1 ? '' : 's'} · {search.rooms} room{search.rooms === 1 ? '' : 's'} · {guestsLabel(search.adults, search.children)}
        </p>
        <Link to="/hotels" className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">Modify search</Link>
      </div>

      <Button type="button" variant="outline" className="mb-4 w-full lg:hidden" aria-expanded={showFilters} onClick={() => setShowFilters((v) => !v)}>
        <SlidersHorizontal aria-hidden /> {showFilters ? 'Hide filters' : `Show filters${chips.length ? ` (${chips.length})` : ''}`}
      </Button>

      <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
        <aside aria-label="Filters" className={`h-fit rounded-2xl border border-border bg-card p-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-auto ${showFilters ? '' : 'hidden lg:block'}`}>
          <FilterPanel filters={filters} onChange={setFilters} bounds={bounds} locations={locations} />
        </aside>
        <main>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              Prices for {search.nights} night{search.nights === 1 ? '' : 's'}, {search.rooms} room{search.rooms === 1 ? '' : 's'}, taxes shown separately
            </p>
            <select
              aria-label="Sort hotels"
              value={sort}
              onChange={(e) => isHotelSort(e.target.value) && setSort(e.target.value)}
              className="rounded-xl border border-border bg-card p-2.5 text-sm font-semibold"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {chips.length > 0 && (
            <ul className="mb-4 flex flex-wrap items-center gap-2" aria-label="Active filters">
              {chips.map((chip) => (
                <li key={chip.key}>
                  <button type="button" onClick={() => setFilters(removeFilter(filters, chip.key))} aria-label={`Remove filter ${chip.label}`} className="inline-flex items-center gap-1 rounded-full bg-primary-light px-3 py-1 text-xs font-bold text-primary">
                    {chip.label} <X aria-hidden className="size-3" />
                  </button>
                </li>
              ))}
              <li><button type="button" onClick={() => setFilters(DEFAULT_FILTERS)} className="text-xs font-semibold text-primary hover:underline">Clear all</button></li>
            </ul>
          )}

          {results.length === 0 ? (
            <div role="status" className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <SearchX aria-hidden className="mx-auto size-10 text-muted" />
              <p className="mt-3 text-lg font-extrabold">No stays match your search</p>
              <p className="mt-1 text-sm text-muted">
                {outcome.inDestination === 0
                  ? `We couldn't find hotels for "${search.query || 'your search'}". Try a nearby city, area or landmark.`
                  : outcome.cannotHost === outcome.inDestination
                    ? 'No hotel here can host your group in the rooms you chose. Try adding a room or changing guests.'
                    : 'Try removing a few filters to see more stays.'}
              </p>
              <div className="mt-4 flex justify-center gap-2">
                {chips.length > 0 && <Button type="button" onClick={() => setFilters(DEFAULT_FILTERS)}>Clear all filters</Button>}
                <Button asChild variant="outline"><Link to="/hotels">Change search</Link></Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((r) => (
                <HotelCard key={r.hotel.id} result={r} nights={search.nights} rooms={search.rooms} query={query} onSelect={remember} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
