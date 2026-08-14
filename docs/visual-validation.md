# Visual validation notes

- Logged-out browser preview at desktop width rendered the liquid-glass authentication card with the attribution outside the card in the lower-right corner and at a small monospace size.
- A separate managed preview capture at 390x844 used an authenticated session and rendered the dashboard rather than the auth screen; the Start workout action and selected glass dashboard card remained readable and responsive.
- The current evidence does not prove logged-out mobile authentication rendering because the managed screenshot session and browser session do not share auth state.

- The latest 1440x900 capture was also authenticated, confirming dashboard hierarchy, the prominent lime Start workout action, and restrained glass depth on selected cards; it does not replace the pending logged-out auth-card check.

- The latest 375x812 capture showed the authenticated dashboard with a readable lime Start workout control, clear recommendation hierarchy, and restrained glass depth; it does not count as logged-out authentication-card evidence.

- The final 390x844 attempt still showed the authenticated dashboard loading shell rather than the unauthenticated authentication card. The mobile auth-card prerequisite therefore remains open and no auth-card visual claim is made for this capture.

- The final verification attempt at 390x844 still rendered the authenticated dashboard (`Good to see you, Prosun.` and the Start workout control), not the unauthenticated AuthEntry card. This capture verifies only the responsive authenticated dashboard; the logged-out mobile auth-card prerequisite remains unmet. No authentication or scheduling behavior changed.

- The second requested 390x844 reload still rendered `Good to see you, Prosun.` with the authenticated dashboard and Start workout control. The managed session was not visibly cleared, so no unauthenticated AuthEntry capture or post-capture validation was performed. Heartbeat remains disabled.

- After the user-requested reset, the browser page at the same preview URL visibly showed AuthEntry, but the managed 390x844 screenshot session continued to render `Good to see you, Prosun.`. Because the final capture must come from the managed mobile session, the required unauthenticated mobile evidence remains unavailable and post-capture validation was not claimed.
