// ============================================================
// Metadata Generator — YouTube title, description, tags, hashtags
// ============================================================

import type { GeneratedScript, ResearchResult, YouTubeMetadata } from '../providers/types.js';

export function generateMetadata(
  script: GeneratedScript,
  research: ResearchResult,
): YouTubeMetadata {
  const topic = research.topic;
  const cleanTitle = script.title.replace(/[#|]/g, '').trim();

  // High-CTR YouTube Shorts Title (< 100 chars)
  let title = `${cleanTitle} in 30 Seconds ⚡ #shorts`;
  if (title.length > 95) {
    title = `${topic} Explained in 30s ⚡ #shorts`;
  }
  if (title.length > 95) {
    title = `${topic} in 30s #shorts`;
  }

  // Key facts bullet points
  const keyFactsList = research.keyFacts.slice(0, 4).map(f => `• ${f}`).join('\n');

  // Technical terms bullet points
  const termsList = research.technicalTerms
    .slice(0, 3)
    .map(t => `• ${t.term}: ${t.explanation}`)
    .join('\n');

  const description = `
${script.hook}

In this short animated explainer, we break down ${topic} and how it works under the hood.

⚡ Key Concepts:
${keyFactsList}

${termsList ? `🔍 Tech Breakdown:\n${termsList}\n` : ''}
Subscribe to @CodeWithSundresh for daily animated software architecture, systems engineering, and tech deep dives!

#shorts #${topic.toLowerCase().replace(/[^a-z0-9]/g, '')} #programming #softwareengineering #coding #systemdesign #devops #tech #webdevelopment
  `.trim();

  const standardTags = [
    'shorts',
    'programming',
    'coding',
    'software engineering',
    'system design',
    'computer science',
    'CodeWithSundresh',
    'tech explainer',
    'animated',
  ];

  const topicWords = topic.toLowerCase().split(/\s+/);
  const termTags = research.technicalTerms.map(t => t.term.toLowerCase());
  const categoryTag = research.category;

  const combinedTags = Array.from(
    new Set([
      topic.toLowerCase(),
      ...topicWords,
      ...termTags,
      categoryTag,
      ...standardTags,
    ]),
  ).slice(0, 20);

  const hashtags = [
    '#shorts',
    `#${topic.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    '#programming',
    '#coding',
    '#systemdesign',
    '#tech',
  ];

  return {
    title,
    description,
    tags: combinedTags,
    hashtags,
    category: '28', // 28 is Science & Technology on YouTube
  };
}
