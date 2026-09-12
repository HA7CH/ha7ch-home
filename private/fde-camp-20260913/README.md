# FDE Camp protected artifacts

The book and slides are gzip-compressed and encrypted with AES-256-GCM before entering this public repository. The decryption key and password verifier are server-only Vercel secrets. Never add plaintext course artifacts or `.env` files here.

The Node route `/fde-camp/[[...path]]` validates an expiring HMAC-signed HttpOnly cookie before reading or decrypting either file. Responses are private, no-store and noindex, including alternate requests and the login form. The cookie expires after seven days. Logout removes it from the browser. Changing the password verifier invalidates existing sessions.

`FDE_CAMP_20260913_KEY` is a 32-byte random hex key. `FDE_CAMP_20260913_PASSWORD` is `salt:hash`, where the 16-byte salt and the 32-byte scrypt output are hex-encoded. Missing or malformed configuration fails closed. The password is never in client code or repository content.

To update content, obtain the authorized source files outside this repository and run `scripts/encrypt-fde-camp.mjs <source-directory>` with the existing encryption key supplied securely in the environment. Changing that key requires re-encrypting both artifacts. Do not log either secret.

The password-attempt throttle is local to a function instance; it is not a distributed firewall. The artifacts are not in `public/`, not included in the sitemap, and have no public download endpoint.
