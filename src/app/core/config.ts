/**
 * Supabase podešavanja. Dok su prazna, aplikacija radi u DEMO režimu:
 * probne igre se čuvaju samo u ovom browseru, a prijava prihvata bilo koju šifru.
 *
 * Anon ključ je javan po dizajnu – bezbednost obezbeđuju RLS pravila u supabase/schema.sql.
 */
export const SUPABASE_URL = 'https://lfoijirrquodqmqfhbmw.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_liEKOCw2-IY8tC9OwLD1RA_ytN1IwuH';

/**
 * Prijava je korisničko ime + šifra. Supabase Auth interno traži email,
 * pa se ime pretvara u `ime@AUTH_EMAIL_DOMAIN`. Na tu adresu se nikad ništa ne šalje.
 */
export const AUTH_EMAIL_DOMAIN = 'ignjatove-igre.app';

export const IS_DEMO = !SUPABASE_URL || !SUPABASE_ANON_KEY;

export const COVERS_BUCKET = 'covers';
export const RULES_BUCKET = 'rules';
