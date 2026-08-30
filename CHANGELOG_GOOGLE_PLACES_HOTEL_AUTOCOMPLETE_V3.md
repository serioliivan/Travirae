# Google Places hotel autocomplete — UI refinement v3

- Removed the secondary address strip shown below the selected hotel.
- The full hotel address, place ID and coordinates remain stored in hidden fields and are still sent to Stay22.
- Check-in and check-out are now selected independently.
- Changing check-in only clears an already selected check-out when it is no longer valid; it never selects a new check-out automatically.
- Updated cache-busting versions on all localized homepages.
- No SQL or Supabase Edge Function changes are required.
