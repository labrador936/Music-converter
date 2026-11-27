# ConvertKit Tools — starter MVP

A first-pass video-to-MP3 converter for files users own or are authorized to process.

## Requirements
- Node.js 20.9+
- FFmpeg installed on the machine and available as `ffmpeg` on PATH

## Run locally
1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Open http://localhost:3000

## Production notes — do these before public launch
This is a development starter, not a hardened public service. Before launch:
- Put the app behind a reverse proxy with request-body limits and HTTPS.
- Add rate limiting, per-IP quotas, concurrency limits, and bot protection.
- Run conversion in an isolated worker/container with CPU, memory and time limits.
- Validate actual file content with a media probe; extensions and browser MIME types are not trustworthy.
- Consider streaming uploads to disk instead of buffering the full file in memory.
- Add a queue for concurrent jobs and monitor storage/CPU usage.
- Configure hosting limits; some serverless hosts do not support FFmpeg or long-running uploads.
- Add privacy policy, terms, abuse reporting, and clear file-retention disclosures.
- Ask Adsterra support to confirm in writing that this exact file-conversion service and intended ad formats are eligible.

## Scope and copyright
This tool processes user-supplied files only. It does not fetch, scrape, or download media from YouTube or other platforms. Users must own the content or have permission to convert it.

## Cost
No paid services are required to run this locally. Do not purchase hosting, a domain, ads, or subscriptions until you explicitly decide to do so.
