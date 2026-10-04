import { z } from 'zod';
import { isCountryCode, parseNationalNumber, parsePhone } from './countries';
import { emailSchema, indianMobileSchema, isoDateSchema } from './common';

export const PASSENGER_TITLES = {
  ADULT: ['MR', 'MRS', 'MS'],
  CHILD: ['MSTR', 'MISS'],
  INFANT: ['MSTR', 'MISS'],
} as const;

/** Whole years between date of birth and a date (both YYYY-MM-DD). */
export function ageOn(dateOfBirth: string, onDate: string): number {
  const [by = 0, bm = 0, bd = 0] = dateOfBirth.split('-').map(Number);
  const [ty = 0, tm = 0, td = 0] = onDate.split('-').map(Number);
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0);
}

/** Airline age bands on the date of travel: infant under 2, child 2–11, adult 12+. */
export function passengerTypeForAge(age: number): 'ADULT' | 'CHILD' | 'INFANT' {
  if (age < 2) return 'INFANT';
  if (age < 12) return 'CHILD';
  return 'ADULT';
}

const travellerName = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Enter ${label}`)
    .max(40, `${label[0]?.toUpperCase()}${label.slice(1)} is too long`)
    .regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/, 'Use letters and spaces only')
    // A single letter is not a name: the first word needs at least two letters.
    .refine((v) => (v.split(' ')[0] ?? '').length >= 2, {
      message: `Enter a full ${label}, not a single letter`,
    })
    // "aaaa" / "xxx" are not names either.
    .refine((v) => !/^([A-Za-z])\1+$/i.test(v.replace(/ /g, '')), {
      message: `Enter a valid ${label}`,
    });

// ───────────────────── International travel documents ─────────────────────

export const VISA_TYPES = ['TOURIST', 'BUSINESS', 'STUDENT', 'WORK', 'TRANSIT', 'EVISA'] as const;
export const VISA_TYPE_LABEL: Record<(typeof VISA_TYPES)[number], string> = {
  TOURIST: 'Tourist visa',
  BUSINESS: 'Business visa',
  STUDENT: 'Student visa',
  WORK: 'Work visa',
  TRANSIT: 'Transit visa',
  EVISA: 'e-Visa',
};

const docDate = (label: string) =>
  z.string({ message: `Enter ${label}` }).min(1, `Enter ${label}`).pipe(isoDateSchema);

const countryField = (label: string) =>
  z.string({ message: `Select ${label}` }).refine(isCountryCode, { message: `Select ${label}` });

const idNumber = (label: string, min: number, max: number) =>
  z
    .string({ message: `Enter ${label}` })
    .trim()
    .toUpperCase()
    .min(1, `Enter ${label}`)
    .regex(new RegExp(`^[A-Z0-9]{${min},${max}}$`), `${label[0]?.toUpperCase()}${label.slice(1)} must be ${min}–${max} letters or digits`)
    .refine((v) => !/^(.)\1+$/.test(v), { message: `Enter a valid ${label}` });

/** Passport and visa details every traveller must give on an international flight. */
export const travelDocumentSchema = z.object({
  nationality: countryField('nationality'),
  passportNumber: idNumber('passport number', 6, 9).refine((v) => /\d/.test(v), {
    message: 'Passport number must contain digits',
  }),
  passportIssuingCountry: countryField('passport issuing country'),
  passportExpiry: docDate('passport expiry date'),
  visaType: z.enum(VISA_TYPES, { message: 'Choose a visa type' }),
  visaNumber: idNumber('visa number', 6, 15),
  visaExpiry: docDate('visa expiry date'),
});
export type TravelDocumentInput = z.output<typeof travelDocumentSchema>;

/** Earliest date of birth accepted for a flight traveller. */
export const MIN_BIRTH_DATE = '1912-01-01';

const birthDateSchema = isoDateSchema.refine((d) => d >= MIN_BIRTH_DATE, {
  message: 'Date of birth cannot be accepted',
});

export const passengerSchema = z
  .object({
    type: z.enum(['ADULT', 'CHILD', 'INFANT']),
    title: z.enum(['MR', 'MRS', 'MS', 'MSTR', 'MISS']),
    firstName: travellerName('first name'),
    lastName: travellerName('last name'),
    dateOfBirth: birthDateSchema.optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    /** Required (checked against the itinerary) only on international flights. */
    travelDocument: travelDocumentSchema.optional(),
  })
  .superRefine((p, ctx) => {
    if (!(PASSENGER_TITLES[p.type] as readonly string[]).includes(p.title)) {
      ctx.addIssue({ code: 'custom', path: ['title'], message: 'Choose a title' });
    }
    if (p.type !== 'ADULT' && !p.dateOfBirth) {
      ctx.addIssue({
        code: 'custom',
        path: ['dateOfBirth'],
        message: 'Date of birth is required for children and infants',
      });
    }
  });
export type PassengerInput = z.output<typeof passengerSchema>;

/** Indian mobile for bookings: also refuses 9999999999-style numbers. */
export const bookingMobileSchema = indianMobileSchema.refine(
  (value) => !/^\+91(\d)\1{9}$/.test(value),
  { message: 'Enter a valid mobile number' },
);

/** Bus contact: Indian mobile only. */
export const contactSchema = z.object({ email: emailSchema, phone: bookingMobileSchema });

/** Any supported country as `+<dial><digits>` (Indian numbers may omit the +91). Outputs E.164. */
export const internationalMobileSchema = z
  .string()
  .trim()
  .transform((value, ctx) => {
    const result = parsePhone(value);
    if (!result.ok) {
      ctx.addIssue({ code: 'custom', message: result.message });
      return z.NEVER;
    }
    return result.e164;
  });

/** Flight contact as the API receives it. */
export const flightContactSchema = z.object({ email: emailSchema, phone: internationalMobileSchema });

/** Flight contact as the web form holds it (country + national digits); outputs `{ email, phone }`. */
export const flightContactFormSchema = z
  .object({
    email: emailSchema,
    countryCode: z.string().refine(isCountryCode, { message: 'Select a country code' }),
    phone: z.string(),
  })
  .transform((value, ctx) => {
    const result = parseNationalNumber(value.countryCode, value.phone);
    if (!result.ok) {
      ctx.addIssue({ code: 'custom', path: ['phone'], message: result.message });
      return z.NEVER;
    }
    return { email: value.email, phone: result.e164 };
  });

/**
 * Checks each passenger's age band on the travel date (so an 11-year-old who turns 12 before the
 * flight travels as an adult).
 */
export function passengerAgeIssues(
  passengers: PassengerInput[],
  travelDate: string,
): { index: number; message: string }[] {
  const issues: { index: number; message: string }[] = [];
  passengers.forEach((p, index) => {
    if (!p.dateOfBirth) return;
    if (p.dateOfBirth > travelDate) {
      issues.push({ index, message: 'Date of birth must be before the travel date' });
      return;
    }
    const actual = passengerTypeForAge(ageOn(p.dateOfBirth, travelDate));
    if (actual !== p.type) {
      const band = {
        ADULT: 'an adult (12+)',
        CHILD: 'a child (2–11)',
        INFANT: 'an infant (under 2)',
      }[actual];
      issues.push({ index, message: `On the travel date this passenger is ${band}` });
    }
  });
  return issues;
}

/** True when the journey touches more than one country (any leg). */
export function isInternationalItinerary(
  offers: { from: { country: string }; to: { country: string } }[],
): boolean {
  const countries = new Set(offers.flatMap((o) => [o.from.country, o.to.country]));
  return countries.size > 1;
}

/** `YYYY-MM-DD` plus whole months (clamped to month end). */
export function addMonthsIso(date: string, months: number): string {
  const [y = 0, m = 1, d = 1] = date.split('-').map(Number);
  const total = y * 12 + (m - 1) + months;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  const last = new Date(Date.UTC(ny, nm, 0)).getUTCDate();
  return `${ny}-${String(nm).padStart(2, '0')}-${String(Math.min(d, last)).padStart(2, '0')}`;
}

const DOCUMENT_FIELDS = [
  'nationality',
  'passportNumber',
  'passportIssuingCountry',
  'passportExpiry',
  'visaType',
  'visaNumber',
  'visaExpiry',
] as const;

/**
 * On an international flight every traveller needs a date of birth, a passport valid for 6 months
 * after the (last) travel date and a visa valid on arrival. `lastTravelDate` is the departure date
 * of the final leg (defaults to `travelDate`).
 */
export function internationalDocumentIssues(
  passengers: PassengerInput[],
  travelDate: string,
  lastTravelDate: string = travelDate,
): { index: number; field: string; message: string }[] {
  const issues: { index: number; field: string; message: string }[] = [];
  const passportMin = addMonthsIso(lastTravelDate, 6);
  passengers.forEach((p, index) => {
    if (!p.dateOfBirth) {
      issues.push({
        index,
        field: 'dateOfBirth',
        message: 'Date of birth is required for international travel',
      });
    }
    const doc = p.travelDocument;
    if (!doc) {
      for (const field of DOCUMENT_FIELDS) {
        issues.push({ index, field: `travelDocument.${field}`, message: 'Passport and visa details are required' });
      }
      return;
    }
    if (doc.passportExpiry < passportMin) {
      issues.push({
        index,
        field: 'travelDocument.passportExpiry',
        message: 'Passport must be valid for at least 6 months after your return/last flight',
      });
    }
    if (doc.visaExpiry < lastTravelDate) {
      issues.push({
        index,
        field: 'travelDocument.visaExpiry',
        message: 'Visa must be valid on your travel date',
      });
    }
  });
  return issues;
}

/** Seats, meals and baggage chosen after traveller details; re-priced and re-checked by the API. */
export const flightAddOnsSchema = z.object({
  seats: z.record(z.string().max(20), z.string().max(8)).default({}),
  meals: z.record(z.string().max(20), z.string().max(40)).default({}),
  baggage: z.record(z.string().max(20), z.string().max(20)).default({}),
});

export const bookFlightSchema = z.object({
  /** One offer per journey leg, in order. */
  offerIds: z.array(z.string().min(5).max(200)).min(1).max(5),
  passengers: z.array(passengerSchema).min(1).max(18),
  contact: flightContactSchema,
  /** Optional paid extras (seat selection, meals, extra baggage). */
  addOns: flightAddOnsSchema.optional(),
  /** The total the customer saw; if the price moved, the API refuses with PRICE_CHANGED. */
  expectedTotalPaise: z.number().int().positive(),
});
export type BookFlightInput = z.output<typeof bookFlightSchema>;

// ───────────────────────────── Buses ─────────────────────────────

export const MAX_BUS_SEATS = 6;

export const busPassengerSchema = z.object({
  seatNumber: z.string().trim().min(1).max(8),
  firstName: travellerName('first name'),
  lastName: travellerName('last name'),
  age: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === 'string' ? v.trim() : String(v)))
    .refine((v) => v !== '', { message: 'Enter age' })
    .refine((v) => /^\d+$/.test(v), { message: 'Age must be a number (digits only)' })
    .transform(Number)
    .pipe(
      z
        .number({ message: 'Enter age' })
        .int('Enter age in whole years')
        .min(1, 'Enter a valid age (1–120)')
        .max(120, 'Enter a valid age (1–120)'),
    ),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
});
export type BusPassengerInput = z.output<typeof busPassengerSchema>;

export const bookBusSchema = z
  .object({
    tripId: z.string().min(5).max(200),
    boardingPointId: z.string().min(1).max(64),
    droppingPointId: z.string().min(1).max(64),
    /** One traveller per seat */
    passengers: z
      .array(busPassengerSchema)
      .min(1)
      .max(MAX_BUS_SEATS, `Up to ${MAX_BUS_SEATS} seats per booking`),
    contact: contactSchema,
    /** Optional promotion applied to this booking. */
    promoCode: z.string().trim().max(40).optional(),
    /** The total the customer saw; if the price moved, the API refuses with PRICE_CHANGED. */
    expectedTotalPaise: z.number().int().positive(),
  })
  .superRefine((b, ctx) => {
    const seen = new Set<string>();
    b.passengers.forEach((p, i) => {
      if (seen.has(p.seatNumber)) {
        ctx.addIssue({
          code: 'custom',
          path: ['passengers', i, 'seatNumber'],
          message: 'Each traveller needs their own seat',
        });
      }
      seen.add(p.seatNumber);
    });
  });
export type BookBusInput = z.output<typeof bookBusSchema>;
