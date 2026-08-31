# Stay22 exact hotel routing v4

- The hotel-specific field now uses the same magnifying-glass icon as destination search.
- A Google-selected property is no longer sent back through Stay22 fuzzy hotel matching.
- Travirae builds a precise Booking.com search URL using the selected hotel name, full address, stay dates and guest count.
- That OTA URL is wrapped by `https://www.stay22.com/allez/booking` through the `link` parameter.
- `aid=travirae`, creator `campaign`, language, currency and existing Supabase outbound tracking are preserved.
- Destination search remains on the original Stay22 searchbar endpoint.
- No SQL or Supabase Edge Function changes are required.
