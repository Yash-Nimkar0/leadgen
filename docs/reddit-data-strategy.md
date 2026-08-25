# Reddit Data Strategy & Compliance

**Status:**
- **Live Ingestion**: Code is built and ready (`RedditProvider`, opt-in via `REDDIT_LIVE_ENABLED`/
  `REDDIT_AUTHORIZED` + credentials, using Reddit's free/non-commercial developer tier - see
  `packages/core/src/providers/reddit/`), but **currently blocked at the account level** - see
  Section 8. No credentials have been obtained; live ingestion has never actually run.
- **Commercial Authorization**: PENDING / NOT AUTHORIZED. Required before this product can be
  operated as a paid or public service using Reddit data - see Section 5.

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

## 8. Free-tier live ingestion for private testing (current state, blocked)
The intent: `REDDIT_LIVE_ENABLED=true` + `REDDIT_AUTHORIZED=true` (plus `REDDIT_CLIENT_ID`/
`REDDIT_CLIENT_SECRET` from a "script" app) would enable live ingestion via Reddit's standard free
developer tier - the non-commercial, personal-use tier described in Section 1 - for **private product
validation only** (nobody charged, not publicly available), not as the live data source once real
users are paying.

**Confirmed blocked, 2026-08-26**: attempted to create a "script" app via the classic flow
(Settings > Apps > OAuth app settings > create app). Submitting the form does nothing - no app is
created - and instead surfaces a link to Reddit's "Responsible Builder Policy"
(support.reddithelp.com, article 42728983564564), which directs non-commercial app development
toward Reddit's newer "Devvit" Developer Platform instead. Devvit is built for apps that run *on*
Reddit (mod tools, subreddit features, interactive posts) via a fundamentally different integration
model, not for external services making read-only API calls from their own backend - it's unclear it
even covers this use case. Net effect: as of this date we have not obtained any Reddit API
credentials, and the classic free-tier path used to be the easy option is no longer straightforwardly
available to new developers either.

**If this is revisited**, check first whether Reddit's script-app creation has reopened, or whether
Devvit has added a capability matching our use case, before assuming this section is still accurate.

**Before removing the private-testing-only constraint** - i.e. before this product is sold to real
customers using Reddit data - Section 5's commercial authorization must be secured first regardless of
which access path is used. Flipping `REDDIT_AUTHORIZED=true` is a statement that a human has read this
document and deliberately chosen to use the free tier for private testing; it is not a claim that
commercial approval has been granted.

## What remains before public/commercial launch
We require an authorized path (an approved commercial API tier or Enterprise API contract) before this
product can be sold using Reddit-derived data. Until then, live ingestion stays scoped to private,
non-monetized testing under the free tier above, and `MockRedditProvider` remains available for
offline development that needs no network access at all.
