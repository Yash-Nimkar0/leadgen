# Reddit Data Strategy & Compliance

**Status as of Implementation Date:**
- **Live Ingestion**: DISABLED
- **Commercial Authorization**: PENDING / NOT AUTHORIZED

## 1. Current Reddit Developer Terms
Reddit's Developer Terms establish strict rules regarding accessing their Services/Data. Standard developer accounts (using standard OAuth/Script apps) are generally intended for non-commercial, hobbyist, or academic use, or for creating non-monetized utilities for Reddit users.

## 2. Current Data API Terms
The Reddit Data API is governed by specific rules protecting user content and Reddit’s commercial interests. Accessing data must occur through authorized API endpoints. Scraping, crawling, or proxy-rotation is explicitly prohibited as a means of circumventing rate limits or access blocks.

## 3. Commercial-Use Requirements
Unless explicitly permitted, **commercial use of the Reddit API requires a separate agreement or written approval from Reddit**. 
"Commercial use" includes monetized SaaS applications that sell insights, leads, or aggregated data derived from Reddit to end users. Using a free-tier script application to run a monetized product violates these terms and risks immediate suspension of access.

## 4. Current Developer Platform Direction
As of August 2026, Reddit announced that new third-party applications will eventually need to transition toward its unified Developer Platform. While this transition is gradual, the direction points toward stricter oversight of what applications are built and how they consume data.

## 5. Required Authorization for Commercial Live Ingestion
Before we can enable live ingestion on this SaaS product, we must:
- Apply for commercial API access via Reddit’s developer portal or enterprise contact form.
- Secure a written agreement or commercial API key/tier that explicitly permits building a SaaS for lead generation based on Reddit data.

## 6. Information Required for Reddit Access Requests
If requesting commercial access, we will likely need to provide Reddit with:
- The exact use-case (B2B Lead Generation based on keywords).
- The volume of requests anticipated.
- How data is stored, displayed, and secured.
- Whether we derive or train AI models from the data (Reddit often restricts using their data for model training).

## 7. Data Storage & Retention Restrictions
The Reddit adapter and our database must adhere to standard terms that include:
- Respecting user deletions. If a user deletes a post on Reddit, our systems should ideally purge or anonymize the local copy.
- Not indefinitely storing raw Reddit content if it is no longer necessary for the core functionality of the app. 
- *Current Architecture Impact*: We currently store a normalized `RedditPost` and our `Analysis`. When scaling live data, we will need to implement a retention policy (e.g., pruning posts older than X days or syncing deletions) to remain compliant.

## What remains before Phase 7B
We require an authorized path (an approved OAuth client or Enterprise API contract) before we can change `REDDIT_LIVE_ENABLED=true` and `REDDIT_AUTHORIZED=true`. Until then, the application continues to run correctly in a development setting using the `MockRedditProvider`.
