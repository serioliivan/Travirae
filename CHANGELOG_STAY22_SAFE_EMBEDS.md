# Stay22 safe embeds fix

- Added a restrictive iframe sandbox to every Stay22 map (main map, destination modal maps and creator-post maps).
- The map can still load, run scripts, display results and use internal forms.
- Popups/new tabs initiated from inside the cross-origin Stay22 iframe are blocked.
- Existing Stay22 embed URLs, affiliate `aid`, creator `campaign` subtracking, language/currency parameters and Travirae outbound-event tracking were not changed.
- Explicit Stay22 CTA buttons remain available and intentionally open only after a direct user click.
