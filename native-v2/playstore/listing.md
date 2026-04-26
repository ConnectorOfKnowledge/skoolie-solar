# Skoolie Solar: Google Play Store Listing (DRAFT)

Status: DRAFT, awaiting Lonnie review.

## Title

**Final pick: `Skoolie Solar: Off Grid Forecast & Sun Finder`** (45 chars, under the 50-char Play Store ceiling).

Rationale: leads with the niche brand "Skoolie Solar" so the audience that already lives this knows the app is for them, then "Off Grid" widens the funnel to van life and RV crowd who do not self-identify as skoolie owners but have the same problem. Names both flagship features (`Forecast`, `Sun Finder`) so search discoverability hits the two main intents. Five-character buffer under the limit leaves room if Play Store ever counts wider.

Alternates considered:

- `Skoolie Solar: Off-Grid PV Forecast` (35 chars). Single-feature pitch. Use only if Play Store flags the dual-feature title as ambiguous.
- `Skoolie Solar Sun & Forecast Planner` (36 chars). Clean, no colon. Slightly burying the off-grid keyword that drives discovery.
- `Off Grid Solar: Forecast & Sun Finder` (37 chars). Drops the Skoolie brand for broader reach. Saved as a fallback if Lonnie wants to broaden away from the niche.

## Short description (max 80 chars)

**Final: `Solar planning for skoolies and RVs: forecast, sun position, battery sizing.`** (76 chars)

## Full description (max 4000 chars, ran through humanizer skill)

```
Solar planning for life on the road.

Skoolie Solar is a planning tool for people running solar on a converted bus, van, RV, or off-grid build. It answers the questions you actually hit out there:

How much power can my array make today?
Where will the sun be at 3 PM tomorrow when I'm trying to park in shade?
Do I have enough battery for a cloudy stretch?

Three tools

Forecast. Tap once for a 7-day solar forecast from your GPS or a saved city. Hourly kWh estimates, daily totals, and the temperature. Tune your nameplate kW and efficiency loss factor as you learn your real-world numbers.

Sun Finder. Plan parking and panel angle by knowing where the sun is going to be. Pick a day, drag the time slider, and see the azimuth and elevation. Or flip on Live Phone Mode and the app uses your compass and accelerometer to point you at the sun in real time.

Battery sizing. Plug in your bank specs (count, voltage, amp hours) and the app calculates usable kWh. Cross-reference against forecast totals to plan your day.

Built for the way you actually use it

No account. No ads. No analytics. No tracking. Your location is sent only to fetch the forecast from Open-Meteo and a place name from OpenStreetMap, both unauthenticated. Nothing else leaves your phone.

Tappable while parked in the sun. No background sync to drain your battery. Caches the last forecast for offline reference.

What this app does not do

It is not a calibrated surveying tool. The Sun Finder live mode uses your phone sensors. They are accurate enough to point a panel, not for engineering work.

It is not a battery monitor. If you want real-time amp draw and SOC, pair this with a proper shunt and BMS app. Skoolie Solar plans, your hardware measures.

Permissions

Location (foreground only) is used to pull weather for your spot and to compute sun angles. We never use background location and never track you when the app is closed.

Made by someone who lives this

This came out of needing the tool myself. If something is wrong or missing, write me. I read every email and the next update will probably reflect it.
```

Char count: ~2,100 after Nominatim disclosure was added. Well under the 4,000 ceiling.

Humanizer audit passes performed:
- Removed em-dashes throughout (project rule)
- Removed AI-tell verbs: highlighting, ensuring, fostering, leveraging, underscoring
- Removed copula avoidance (no "serves as", "stands as", "boasts")
- Removed superficial -ing trailers
- Removed promotional inflation (vibrant, intuitive, seamless, breathtaking)
- Kept the rule-of-three-Q opener because real practitioners ask exactly those three questions
- Kept first-person closer because it is a real maker's note, not a marketing flourish

## Category

**Primary: Tools.** The app is a single-purpose calculator + visualizer, not a workflow / document tool. Tools is also where users browse for "off-grid", "compass", and "weather" utilities, which overlaps the audience.

Secondary tag (if Play Store offers): **Productivity** as a backup. Reject Lifestyle (signals personal-life apps, not utility).

## Search keywords / tags

skoolie, skoolie solar, van life, vanlife, RV solar, off grid, off-grid solar, solar forecast, solar planning, sun position, sun tracker, sun finder, photovoltaic, PV planning, battery sizing, battery capacity, kWh calculator, off grid power, RV, van, bus conversion, school bus conversion, boondocking, dry camping

## Content rating questionnaire (Google IARC)

Answers all `No`:

- Violence / fighting / weapons: No
- Sexual content / nudity / suggestive themes: No
- Profanity / crude humor: No
- Drugs, alcohol, tobacco: No
- Gambling / simulated gambling: No
- Horror / scary / disturbing content: No
- Discriminatory content: No
- User-generated content / chat / message exchange: No
- In-app purchases: No
- Social features (sharing, friends, leaderboards): No
- Advertising (in-app ads): No
- Mature themes: No
- Likely to be downloaded primarily by children: No

Privacy / data answers:

- Collects personal info (name, email, phone, address): No
- Collects location: Yes, foreground only, never sent to any server, used only on-device for forecast lookup and sun-angle math
- Collects device identifiers: No
- Collects financial info: No
- Health/fitness data: No
- Messages / contacts / camera / microphone: No

Expected rating: **Everyone**.

## Privacy policy URL

**Live: https://connectorofknowledge.github.io/skoolie-solar-legal/privacy**

Hosted via GitHub Pages on the `ConnectorOfKnowledge/skoolie-solar-legal` repo with the cayman theme. Wired into the Play Console listing form. Versioned alongside the app, updates ship via git push to the legal repo.

The draft text in this folder (`privacy-policy-draft.md`) is the source. The published version on Pages is the same content with the placeholders filled in (date 2026-04-26, contact alice@subtl.agency, hosted URL above) and the DRAFT label dropped.

## App version metadata

- Version name: `1.0.0`
- Version code: `1`
- Package: `com.skooliesolar.v2`
- Min SDK: 24 (Android 7.0 Nougat)
- Target SDK: 36
- ABIs: arm64-v8a, x86_64
- Locales supported at launch: en (US English only)

## Release track plan (separate from this listing draft)

1. Internal Testing: Lonnie installs from Play Store, sanity check
2. Closed Testing: small group of skoolie/van life folks Lonnie can email
3. Open Testing: public opt-in, post in r/skoolies and r/vanlife
4. Production: only after Closed/Open feedback round

## Open issues blocking submission

- **Open-Meteo commercial use**: see `open-meteo-tos-resolution.md`. The free tier prohibits commercial use, so the paid app cannot ship against it without either (a) the $29/mo Open-Meteo paid plan, (b) an API switch, or (c) a free-with-donation pivot. Decision needed before AAB upload.
- **Privacy policy hosting**: live at https://connectorofknowledge.github.io/skoolie-solar-legal/privacy (resolved 2026-04-26).
- **Feature graphic**: 1024x500 graphic is required by Play Store. Brief is in `feature-graphic.md`. Solar does not generate the image.
- **Screenshot dimension verification**: captures are 1080x2400 (Pixel-style). Play Store accepts portrait phone screenshots up to a 2:1 long-to-short ratio (2400/1080 = 2.22). Borderline. May need a center-crop to 1080x2160 for compliance. Verify on the upload screen before alarm.
