# Travirae custom Stay22 search widget

- Replaced the Stay22 map embedded at the top of every localized homepage with a Travirae-branded accommodation search form.
- The form sends destination, check-in, check-out, adults, children, language and currency to the official Stay22 `/allez/searchbar` endpoint.
- Affiliate tracking remains `aid=travirae`.
- When a valid Travirae affiliate/creator referral is active, the existing affiliate slug remains the Stay22 `campaign` value.
- Existing Supabase outbound-widget tracking is preserved through `traviraeAffiliate.trackWidgetOutbound`.
- No SQL, Supabase table or Edge Function changes are required.
- Destination-modal Stay22 maps and creator-post widgets were not changed.
