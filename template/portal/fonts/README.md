# Embedded fonts

Latin-subset woff2 files fetched from Google Fonts and embedded into built portals so they
work offline. Poppins is licensed under the SIL Open Font License 1.1, which permits
embedding and redistribution. Add a client's typeface here as `<family>-<weight>.woff2`
and `tools/build-portal.js` embeds it; without files it falls back to a Google Fonts link.
