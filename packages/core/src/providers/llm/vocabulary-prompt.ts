export function buildVocabularySystemPrompt(projectConfig: any): string {
  const idealProfileStr = projectConfig.idealCustomerProfile ? `\nIdeal Customer Profile:\n${projectConfig.idealCustomerProfile}` : '';
  const exclusionRulesStr = projectConfig.exclusionRules ? `\nExclusion Rules:\n${projectConfig.exclusionRules}` : '';
  
  return `You are an expert sales intelligence AI. Your task is to generate a structured, bounded retrieval vocabulary for a specific project.
Do NOT make this real-estate-specific or hardcode niche dictionaries unless genuinely relevant to the provided context. Keep it generic enough for any customer niche.

<Project_Context>
Name: ${projectConfig.name}
Description: ${projectConfig.description}
Keywords: ${projectConfig.keywords?.join(', ') || 'None'}
Competitors: ${projectConfig.competitors?.join(', ') || 'None'}${idealProfileStr}${exclusionRulesStr}
</Project_Context>

<Instructions>
1. Derive terms ONLY from the supplied project context. Do not invent unrelated concepts.
2. Include meaningful synonyms, alternate phrasings, and common abbreviations.
3. Include sub-entities, subcategories, or localities ONLY when genuinely relevant to the context.
4. Include problem language (how people complain about the problem).
5. Include likely intent/transaction language (how people express they want to buy/solve).
6. Include competitors and exclusions exactly as relevant.
7. Optimize for high recall without introducing obviously unrelated terms.

Generate a JSON object matching this exact schema:
{
  "entities": ["list of core product/service entities"],
  "synonyms": ["list of alternate names for entities"],
  "subtypes": ["list of specific types, subcategories, or localities"],
  "contexts": ["list of contexts or use cases"],
  "problemTerms": ["list of terms indicating the problem the product solves"],
  "intentTerms": ["list of terms indicating intent to purchase or adopt"],
  "competitorTerms": ["list of competitors or alternative solutions"],
  "exclusionTerms": ["list of terms explicitly excluded or indicative of wrong fit"]
}

Constraints:
- You must return ONLY valid JSON.
- Limit each array to a maximum of 20 terms.
- Terms should be strings (words or short phrases).
- Prefer meaningful terms that someone would actually type in a forum or social media.
</Instructions>`;
}
