import { config } from "dotenv";
import { resolve } from "path";
import { GeminiProvider } from "../providers/llm/gemini-provider";
import { OpenAIProvider } from "../providers/llm/openai-provider";
import { GroqProvider } from "../providers/llm/groq-provider";
import { XAIProvider } from "../providers/llm/xai-provider";
import { LLMRouter } from "../providers/llm/llm-router";
import { ILLMProvider } from "../providers/llm/interfaces";
import { mockFixtures } from "../providers/reddit/fixtures";
import { Scorer } from "../ingestion/scorer";
import * as fs from "fs";
import * as path from "path";

const scorer = new Scorer();

// Load .env
config({ path: resolve(__dirname, "../../../../.env") });

function getProjectConfigForFixture(fixtureKey: string) {
  if (fixtureKey.startsWith('AI_SUPPORT') || fixtureKey === 'IRRELEVANT_1' || fixtureKey === 'PROMPT_INJECTION') {
    return {
      name: "Acme AI Support",
      description: "AI customer support software for SaaS companies",
      keywords: ["support", "customer service", "helpdesk"],
      competitors: ["Intercom", "Zendesk"]
    };
  }
  if (fixtureKey.startsWith('CRM') || fixtureKey === 'LOW_VALUE_QUESTION') {
    return {
      name: "Acme CRM",
      description: "CRM software for small/mid-sized sales teams",
      keywords: ["crm", "sales", "pipeline"],
      competitors: ["HubSpot", "Salesforce", "Pipedrive"]
    };
  }
  if (fixtureKey.startsWith('DEVOPS')) {
    return {
      name: "Acme CI/CD",
      description: "CI/CD platform for modern software teams and monorepos",
      keywords: ["ci/cd", "pipeline", "deployment"],
      competitors: ["GitHub Actions", "GitLab CI", "Jenkins"]
    };
  }
  if (fixtureKey.startsWith('MKT') || fixtureKey === 'IRRELEVANT_2') {
    return {
      name: "Acme Marketing",
      description: "Email marketing platform for SaaS companies",
      keywords: ["email", "newsletter", "marketing"],
      competitors: ["Mailchimp", "ConvertKit", "Klaviyo"]
    };
  }
  if (fixtureKey.startsWith('ANALYTICS')) {
    return {
      name: "Acme Analytics",
      description: "Simple product analytics platform for SaaS companies",
      keywords: ["analytics", "tracking", "events"],
      competitors: ["GA4", "Mixpanel", "Amplitude"]
    };
  }
  if (fixtureKey.startsWith('ECOM')) {
    return {
      name: "Acme B2B Commerce",
      description: "B2B e-commerce platform with advanced pricing and payment terms",
      keywords: ["ecommerce", "b2b", "store"],
      competitors: ["Shopify", "BigCommerce", "Magento"]
    };
  }
  if (fixtureKey.startsWith('DESIGN')) {
    return {
      name: "Acme Design",
      description: "Collaborative design/prototyping software for agencies",
      keywords: ["design", "prototype", "ui"],
      competitors: ["Figma", "Penpot", "Sketch"]
    };
  }
  if (fixtureKey.startsWith('PROD_')) {
    return {
      name: "Acme Projects",
      description: "Simple project management software for small engineering teams",
      keywords: ["project management", "tickets", "agile"],
      competitors: ["Jira", "Linear", "Asana"]
    };
  }
  if (fixtureKey.startsWith('SEC_')) {
    return {
      name: "Acme Security",
      description: "Security/compliance automation platform for startups",
      keywords: ["soc2", "compliance", "security", "waf"],
      competitors: ["Vanta", "Drata", "Secureframe"]
    };
  }
  if (fixtureKey === 'DEV_PASSIVE' || fixtureKey === 'NOISE_RANT') {
    return {
      name: "Acme React State",
      description: "React state management library for modern web apps",
      keywords: ["react", "state", "frontend"],
      competitors: ["Redux", "Zustand", "Jotai"]
    };
  }
  
  // Fallback
  return {
    name: "Acme Generic SaaS",
    description: "Generic SaaS platform",
    keywords: ["software", "b2b", "saas"],
    competitors: ["Competitor A", "Competitor B"]
  };
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runEvaluation() {
  // Parse args
  let limit = Infinity;
  let providerArg = 'gemini';
  let fixturesArg: string[] | null = null;

  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--limit=')) {
      limit = parseInt(arg.split('=')[1] || '', 10);
    }
    if (arg.startsWith('--provider=')) {
      providerArg = arg.split('=')[1] || '';
    }
    if (arg.startsWith('--fixtures=')) {
      fixturesArg = (arg.split('=')[1] || '').split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  const RESULTS_DIR = resolve(__dirname, "../../../../evaluation-results");
  // A --fixtures run writes to its own file so it never reads from or clobbers the full
  // baseline in `${providerArg}-latest.json` (that file's resumability cache would otherwise
  // just replay stale pre-change results for any fixture already recorded there).
  const RESULTS_FILE = path.join(RESULTS_DIR, fixturesArg ? `${providerArg}-targeted.json` : `${providerArg}-latest.json`);

  let provider: ILLMProvider;
  if (providerArg === 'router') {
    provider = new LLMRouter();
  } else if (providerArg === 'openai') {
    provider = new OpenAIProvider();
  } else if (providerArg === 'groq') {
    provider = new GroqProvider();
  } else if (providerArg === 'xai') {
    provider = new XAIProvider();
  } else {
    provider = new GeminiProvider();
  }

  const pacingDelay = process.env.GEMINI_EVAL_DELAY_MS ? parseInt(process.env.GEMINI_EVAL_DELAY_MS, 10) : 4500;

  
  const allEntries = Object.entries(mockFixtures);
  let fixtureEntries = allEntries.filter(([key]) => key !== 'DUPLICATE_OF_ACTIVE');

  if (fixturesArg) {
    const wanted = new Set(fixturesArg);
    fixtureEntries = fixtureEntries.filter(([key]) => wanted.has(key));
  }

  if (limit !== Infinity) {
    fixtureEntries = fixtureEntries.slice(0, limit);
  }

  // Load previous results for resumability
  let savedResults: Record<string, any> = {};
  if (fs.existsSync(RESULTS_FILE)) {
    try {
      savedResults = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
      console.log(`Loaded ${Object.keys(savedResults).length} previously completed fixtures.`);
    } catch (e) {
      console.error("Failed to parse previous results. Starting fresh.");
    }
  } else {
    if (!fs.existsSync(RESULTS_DIR)) {
      fs.mkdirSync(RESULTS_DIR, { recursive: true });
    }
  }

  let evaluatedCount = 0;
  let failedCount = 0;
  let rateLimitedCount = 0;
  
  let correctIntent = 0;
  let correctRelevance = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  let scoreDeviationSum = 0;

  const mismatches: any[] = [];
  const rateLimitFailures: any[] = [];
  const standardFailures: any[] = [];

  for (const [key, fixture] of fixtureEntries) {
    if (!fixture.expected) {
      continue;
    }

    if (savedResults[key]) {
      console.log(`Skipping ${key} (already evaluated in previous run)`);
      const result = savedResults[key];
      tallyResult(key, fixture, result);
      continue;
    }

    console.log(`Evaluating ${key}...`);

    const classificationInput = {
      post: fixture,
      projectConfig: getProjectConfigForFixture(key)
    };

    let success = false;
    let rateLimited = false;
    let retries = 0;
    const maxRetries = 2; // bounded retry
    let result: any = null;

    while (!success && !rateLimited && retries <= maxRetries) {
      try {
        if (retries > 0) console.log(`  Attempt ${retries + 1}...`);
        
        // Add a safety timeout to the promise if the SDK hangs indefinitely (e.g. 15s)
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 15000));
        result = await Promise.race([provider.classify(classificationInput), timeoutPromise]);
        
        success = true;
      } catch (error: any) {
        if (error.message === 'TIMEOUT' || error.message?.includes("429") || error.status === 429 || error.status === "RESOURCE_EXHAUSTED") {
          let delay = 5000 * Math.pow(2, retries);
          const retryMatch = error.message?.match(/retry in ([\d.]+)s/);
          if (retryMatch && retryMatch[1]) {
            delay = (parseFloat(retryMatch[1]) * 1000);
          }
          
          if (delay > 20000) {
            // Unrecoverable quota within a reasonable window
            console.log(`  Hit long rate limit / timeout (${delay}ms). Marking RATE_LIMITED.`);
            rateLimitFailures.push({ id: fixture.externalId, error: `Long delay: ${delay}ms` });
            rateLimited = true;
            break;
          }

          if (retries < maxRetries) {
            retries++;
            console.log(`  Rate limited / timeout. Sleeping ${delay}ms...`);
            await sleep(delay);
          } else {
            rateLimitFailures.push({ id: fixture.externalId, error: error.message || 'Max retries exceeded' });
            rateLimited = true;
            break;
          }
        } else {
          // Non-429 error
          standardFailures.push({ id: fixture.externalId, error: error.message || String(error) });
          break;
        }
      }
    }

    if (rateLimited) {
      rateLimitedCount++;
      continue;
    }

    if (!success) {
      failedCount++;
      continue;
    }

    if (success && (result as any)._routerMetadata) {
      const rm = (result as any)._routerMetadata;
      console.log(`  -> provider: ${rm.provider}, latency: ${rm.latency}ms, fallbackDepth: ${rm.fallbackDepth}`);
    }

    // Save successful result
    savedResults[key] = result;
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(savedResults, null, 2));

    tallyResult(key, fixture, result);
    
    // Add base delay to avoid Gemini Free Tier rate limits (15 RPM)
    await sleep(pacingDelay);
  }


  function tallyResult(key: string, fixture: any, result: any) {
    evaluatedCount++;

    const expected = fixture.expected;
    const actualIntent = result.intentType;
    // The fixture's minIntentScore/maxIntentScore ranges represent the expected final
    // business score (what actually drives prioritization/notifications), not the LLM's
    // raw commercialIntent signal - so compare against the deterministic Scorer output.
    const actualScore = scorer.calculateFinalScore(result);
    const actualRelevanceScore = result.relevance;
    
    let isMismatch = false;
    const mismatchReasons: string[] = [];

    // Check Intent Type
    if (actualIntent !== expected.intentType) {
      isMismatch = true;
      mismatchReasons.push(`Expected Intent: ${expected.intentType}, Actual: ${actualIntent}`);
    } else {
      correctIntent++;
    }

    // Check Score Range
    if (actualScore < expected.minIntentScore || actualScore > expected.maxIntentScore) {
      isMismatch = true;
      mismatchReasons.push(`Expected Score Range: ${expected.minIntentScore}-${expected.maxIntentScore}, Actual: ${actualScore}`);
      scoreDeviationSum += Math.min(Math.abs(actualScore - expected.minIntentScore), Math.abs(actualScore - expected.maxIntentScore));
    }

    // Relevance logic mapping: HIGH > 75, MEDIUM > 40, LOW <= 40
    let actualRelevanceLevel = "LOW";
    if (actualRelevanceScore > 75) actualRelevanceLevel = "HIGH";
    else if (actualRelevanceScore > 40) actualRelevanceLevel = "MEDIUM";

    if (actualRelevanceLevel !== expected.relevanceLevel) {
      isMismatch = true;
      mismatchReasons.push(`Expected Relevance: ${expected.relevanceLevel}, Actual: ${actualRelevanceLevel} (${actualRelevanceScore})`);
    } else {
      correctRelevance++;
    }

    // False Positives / Negatives
    const isExpectedHighIntent = expected.intentType === 'ACTIVE_PURCHASE' || expected.intentType === 'ALTERNATIVE_SEEKING';
    const isActualHighIntent = actualIntent === 'ACTIVE_PURCHASE' || actualIntent === 'ALTERNATIVE_SEEKING';

    if (isActualHighIntent && !isExpectedHighIntent) falsePositives++;
    if (!isActualHighIntent && isExpectedHighIntent) falseNegatives++;

    if (isMismatch) {
      mismatches.push({
        id: fixture.externalId,
        title: fixture.title,
        context: getProjectConfigForFixture(key).name,
        expectedIntent: expected.intentType,
        actualIntent,
        expectedScoreRange: `${expected.minIntentScore}-${expected.maxIntentScore}`,
        actualScore,
        expectedRelevance: expected.relevanceLevel,
        actualRelevance: actualRelevanceLevel,
        reasons: mismatchReasons
      });
    }
  }

  // Generate Report EXACTLY matching user request
  console.log(`\n${providerArg.toUpperCase()} BASELINE EVALUATION\n`);
  console.log(`Total fixtures: ${fixtureEntries.length}`);
  console.log(`Successfully evaluated: ${evaluatedCount}`);
  console.log(`Rate limited: ${rateLimitedCount}`);
  console.log(`Failed: ${failedCount}\n`);

  if (evaluatedCount > 0) {
    console.log(`Intent-type accuracy: ${((correctIntent / evaluatedCount) * 100).toFixed(1)}%`);
    console.log(`Relevance accuracy: ${((correctRelevance / evaluatedCount) * 100).toFixed(1)}%`);
    console.log(`Average absolute score error: ${(scoreDeviationSum / evaluatedCount).toFixed(1)} pts`);
  } else {
    console.log(`Intent-type accuracy: 0.0%`);
    console.log(`Relevance accuracy: 0.0%`);
    console.log(`Average absolute score error: 0.0 pts`);
  }
  console.log(`False positives: ${falsePositives}`);
  console.log(`False negatives: ${falseNegatives}\n`);
  
  const intentMismatches = mismatches.filter(m => m.reasons.some((r: string) => r.includes('Expected Intent')));
  const relevanceMismatches = mismatches.filter(m => m.reasons.some((r: string) => r.includes('Expected Relevance')));
  const scoreMismatches = mismatches.filter(m => m.reasons.some((r: string) => r.includes('Expected Score Range')));

  const printMismatch = (m: any) => {
    console.log(`🔹 Fixture ID: ${m.id}`);
    console.log(`   Title:             ${m.title}`);
    console.log(`   Context:           ${m.context}`);
    console.log(`   Expected Intent:   ${m.expectedIntent}`);
    console.log(`   Actual Intent:     ${m.actualIntent}`);
    console.log(`   Expected Score:    ${m.expectedScoreRange}`);
    console.log(`   Actual Score:      ${m.actualScore}`);
    console.log(`   Expected Relevance:${m.expectedRelevance}`);
    console.log(`   Actual Relevance:  ${m.actualRelevance}`);
    console.log(`   Reasons:           ${m.reasons.join(" | ")}\n`);
  };

  console.log("Intent-type mismatches:");
  if (intentMismatches.length > 0) intentMismatches.forEach(printMismatch);
  else console.log("None\n");

  console.log("Relevance mismatches:");
  if (relevanceMismatches.length > 0) relevanceMismatches.forEach(printMismatch);
  else console.log("None\n");

  console.log("Score-range mismatches:");
  if (scoreMismatches.length > 0) scoreMismatches.forEach(printMismatch);
  else console.log("None\n");

  console.log("Rate-limit failures:");
  if (rateLimitFailures.length > 0) {
    rateLimitFailures.forEach(f => {
      console.log(`- ${f.id}: ${f.error}`);
    });
  } else {
    console.log("None\n");
  }

  console.log("Standard failures:");
  if (standardFailures.length > 0) {
    standardFailures.forEach(f => {
      console.log(`- ${f.id}: ${f.error}`);
    });
  } else {
    console.log("None\n");
  }
}

runEvaluation().catch(console.error);
