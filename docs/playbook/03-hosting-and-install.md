# Hosting a portal, and making it installable

The single-file build is for email and USB sticks. This is the other deliverable: a
folder you deploy, which a member or an owner can install on their phone.

```
node tools/build-portal.js onyx --site
```

Writes `clients/onyx/site/` — deploy that folder as the site root.

```
index.html              the portal, simulations linked rather than inlined
manifest.webmanifest    what makes it installable
sw.js                   offline, and the second half of installable
icons/                  192, 512, 512 maskable, apple-touch
content/sims/           fetched the first time each one is opened
robots.txt  _headers    noindex, and cache rules
```

## Pick a subdomain, not a path

`onyx.example.app`, not `example.app/onyx`. Three reasons, in order of how much they
will hurt later:

1. **`localStorage` is scoped to origin, not path.** Every client under one host shares
   one jar. The portal namespaces by `storageKey`, so nothing collides today — but one
   mistyped key in the next client's config silently reads or overwrites this one's
   data. Separate subdomains make that impossible in the browser rather than by
   convention.
2. **Service worker scope follows the path.** At a root, `sw.js` gets scope `/` and
   there is nothing to configure. Under a folder you need one worker per client, each
   registered with an explicit scope, all competing on one origin.
3. **The demo should have the shape of production.** A client ends up on their own
   host — `learn.theirdomain.com.au`. From a subdomain that is a DNS change and nothing
   else. From `/onyx` the app also moves to `/`, changing `start_url`, manifest scope,
   worker scope and the install identity, which forces a re-test of the PWA on iOS.

Each client also gets its own deploy and its own rollback, so shipping one is not
shipping all of them.

## HTTPS is not optional

On a `.app` domain it is not even negotiable: Google runs the TLD and the whole thing is
on the HSTS preload list, so browsers refuse plain HTTP with no click-through. Point it
at anything without a certificate and you get a dead site and no useful error. Netlify,
Cloudflare Pages and Vercel all issue one automatically; that is the whole of the work.

A service worker needs a secure context too, so without HTTPS there is no install and no
offline either — `localhost` is the only exception, which is how to test it locally:

```
cd clients/onyx/site && python3 -m http.server 8000
```

## Deploying

Any static host. There is nothing to configure, because the portal routes on the hash —
`#/reports` never reaches the server, so there are no rewrite rules or SPA fallbacks to
get wrong. Drag the folder onto Netlify, or point Cloudflare Pages at the repo with
`node tools/build-portal.js <slug> --site` as the build command and `clients/<slug>/site`
as the output directory.

`_headers` is read by both Netlify and Cloudflare Pages. It keeps `index.html`, `sw.js`
and the manifest on `no-cache` so a deploy actually reaches people, and lets the icons
cache for a year. Do not let a CDN cache `sw.js`: a stale worker pins everyone to an old
portal and it is the one file you cannot fix by deploying again.

Site builds are `noindex` in `robots.txt`, in `_headers` and in a meta tag. Pass
`--indexable` when a portal is genuinely meant to be found. Client-branded demo content
should not be.

## The keys are still a curtain

`employee`, `manager` and `owner` are checked in the browser. On a public URL anyone who
finds it can type `owner`. That is fine for a showcase and it is documented as such, but
if a client asks who can see this, the answer is authentication in front of the site —
Cloudflare Access is free for a small team — not a better key.

## Installing

Four things are required, and the build emits all of them: HTTPS, a manifest with
192 and 512 icons, a service worker with a `fetch` handler, and a `<link rel="manifest">`.
The engine only turns any of it on when the build injected `<meta name="portal-installable">`,
so a file opened from a USB stick does not offer to install itself.

**A PWA cannot be a single file.** The manifest and the worker have to be separate files
at real URLs. That is why there are two build targets rather than one with a flag.

### Android and desktop get a real prompt; iOS does not

Chrome and Edge fire `beforeinstallprompt`. The engine holds onto it and puts an Install
control on the welcome screen and in the menu, so the offer is in the portal's own words
instead of a browser banner.

Safari fires nothing and has no API for it. On iOS the same control opens the two-step
instructions instead — Share, then Add to Home Screen. Both controls stay hidden unless
installation is genuinely possible, so there is never a button that does nothing. If you
are demonstrating the install live, do it on Android.

### The thing to say before somebody finds it

**An installed iOS PWA gets its own storage, separate from Safari's.** Everything in the
portal lives in per-device `localStorage`: progress, favourites, drafts, posts, imported
report data. So browse in Safari, install it, open the icon — and it is empty. Different
phone, empty. An owner who imports an export on a laptop will not see it on their phone.

That is honest and it is labelled throughout, and on one device it reads as a reasonable
limitation. Installing is the moment it stops reading that way, because an icon on a home
screen is exactly when people expect their things to follow them. The answer is accounts
and somewhere to keep them, which is a product decision rather than a build flag. Raise
it before a client discovers it.

## The worker

Generated by the build, named after a hash of `index.html`, so a deploy that changed
nothing evicts nobody and a deploy that changed something takes effect.

- **Navigations are network-first.** A deploy lands on the next load rather than whenever
  a cache happens to turn over; offline falls back to the stored copy.
- **Everything else is cache-first.** A simulation is fetched once and then belongs to the
  phone, which is the point on gym wifi.
- **Cross-origin requests are not touched.** The only one is the spreadsheet parser the
  importer fetches on demand, and caching an opaque response there buys nothing and hides
  failures.

Offline is real, not theoretical: load the portal once, drop the connection, and it still
opens with its navigation and any simulation already viewed.
