export const RESEARCH_BANK = [
  {
    id: "gratitude",
    category: "Morning Ritual",
    categoryColor: "cyan",
    headline: "Gratitude rewires attention. This isn't fluffy — it's neuroscience.",
    appLine: "Start your day by training your mind to notice what's working before chasing what's missing.",
    stat: "64 randomized clinical trials proved gratitude interventions reduce anxiety and depression symptoms.",
    source: "Gratitude Intervention Meta-Analysis, 2023",
    sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10393216/",
    icon: "🧠",
    countTarget: 64,
    placement: ["GratitudePanel"]
  },
  {
    id: "planning",
    category: "Battle Plan",
    categoryColor: "gold",
    headline: "Don't wake up negotiating with yourself. Plan tonight. Execute tomorrow.",
    appLine: "If-then planning removes morning decision fatigue before it starts.",
    stat: "Implementation intentions improve goal attainment with a medium-to-large effect size (d = 0.65) — one of the strongest in behavioral science.",
    source: "Implementation Intentions Meta-Analysis",
    sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8149892/",
    icon: "🎯",
    countTarget: 65,
    placement: ["BattlePlanPanel"]
  },
  {
    id: "written_goals",
    category: "Written Goals",
    categoryColor: "gold",
    headline: "A goal in your head is a wish. A goal on the map becomes a mission.",
    appLine: "Writing your goal is the first execution. Every map entry is a move.",
    stat: "People with written goals, action commitments, and weekly progress reports scored 7.6 vs 4.28 for unwritten goals — nearly double the achievement.",
    source: "Dominican University Goals Research — Gail Matthews",
    sourceUrl: "https://www.dominican.edu/sites/default/files/2020-02/gailmatthews-harvard-goals-researchsummary.pdf",
    icon: "📝",
    countTarget: 76,
    placement: []
  },
  {
    id: "accountability",
    category: "Progress Reports",
    categoryColor: "green",
    headline: "Progress reported is progress respected. Proof creates pressure.",
    appLine: "Sending weekly updates isn't optional — it's the variable that separates achievers from dreamers.",
    stat: "76% of people who wrote goals and sent weekly progress updates achieved them. Only 43% who kept goals in their head did.",
    source: "Michigan State / Dominican University Goals Research",
    sourceUrl: "https://www.canr.msu.edu/news/achieving_your_goals_an_evidence_based_approach",
    icon: "📊",
    countTarget: 76,
    placement: []
  },
  {
    id: "daily_tracking",
    category: "Daily Proof",
    categoryColor: "cyan",
    headline: "Small proof beats big promises. Track the evidence that you are becoming who you said you'd be.",
    appLine: "Every checked box is a data point. The data rewires your identity.",
    stat: "138 studies with 19,951 participants: progress-monitoring interventions promote goal attainment, especially when progress is physically recorded (d = 0.40).",
    source: "Progress Monitoring Meta-Analysis — White Rose Research",
    sourceUrl: "https://eprints.whiterose.ac.uk/id/eprint/87431/",
    icon: "✅",
    countTarget: 138,
    placement: ["TopFivePanel"]
  },
  {
    id: "weekly_review",
    category: "Sunday Review",
    categoryColor: "cyan",
    headline: "Sunday is where the map updates. Review the week, adjust the route, recommit to the next milestone.",
    appLine: "Self-regulation requires checking the gap between where you are and where you're going.",
    stat: "The same 138-study meta-analysis shows self-regulation depends on regular gap-checking between current progress and the goal — the Sunday Review is that mechanism.",
    source: "Progress Monitoring Meta-Analysis — White Rose Research",
    sourceUrl: "https://eprints.whiterose.ac.uk/id/eprint/87431/",
    icon: "🧭",
    countTarget: 138,
    placement: ["WeeklyReviewPage"]
  },
  {
    id: "milestones",
    category: "Small Wins",
    categoryColor: "green",
    headline: "Momentum is medicine. Every small win tells your brain: we're moving.",
    appLine: "Progress in meaningful work is the single strongest driver of motivation. Not recognition. Not money. Progress.",
    stat: "Harvard researchers analyzed 11,637 diary entries from 238 professionals and found that forward momentum — even small — creates the best inner work life.",
    source: "Harvard Business School — The Progress Principle",
    sourceUrl: "https://www.hbs.edu/faculty/Pages/item.aspx?num=40692",
    icon: "💎",
    countTarget: 238,
    placement: ["MilestoneDetailPage"]
  },
  {
    id: "rewards",
    category: "Rewards",
    categoryColor: "gold",
    headline: "You don't reward avoidance. You reward execution.",
    appLine: "Rewards attached to completion — not promises — create the strongest behavioral loops.",
    stat: "Progress monitoring combined with visible wins and reinforcement is one of the most reliable behavior change mechanisms in the evidence base.",
    source: "Progress Monitoring Meta-Analysis — White Rose Research",
    sourceUrl: "https://eprints.whiterose.ac.uk/id/eprint/87431/",
    icon: "🏆",
    countTarget: 40,
    placement: ["RewardsPage"]
  },
  {
    id: "habit_building",
    category: "Habit Building",
    categoryColor: "purple",
    headline: "This isn't a 21-day fantasy. Identity is built through repeated proof.",
    appLine: "The 21-day myth was never real. Habits take as long as they take — and that's okay.",
    stat: "Phillippa Lally's research found habits took an average of 66 days to form, with a range from 18 to 254 days depending on the person and behavior.",
    source: "Modelling Habit Formation in the Real World — Lally, 2010",
    sourceUrl: "https://onlinelibrary.wiley.com/doi/full/10.1002/ejsp.674",
    icon: "🔄",
    countTarget: 66,
    placement: []
  },
  {
    id: "identity",
    category: "Identity Shift",
    categoryColor: "purple",
    headline: "Your actions are not just tasks. They are votes for who you are becoming.",
    appLine: "When habits connect to identity, they become nearly automatic. You stop doing the habit — you become the person who does it.",
    stat: "Research shows habit-identity links are associated with higher self-esteem, cognitive self-integration, and striving toward an ideal self.",
    source: "Habit and Identity — Frontiers in Psychology",
    sourceUrl: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.01504/full",
    icon: "🧬",
    countTarget: 144,
    placement: ["IdentityPage"]
  },
  {
    id: "affirmations",
    category: "Declarations",
    categoryColor: "pink",
    headline: "Declare the identity before the old pattern gets the microphone.",
    appLine: "Affirmations work — not as wishful thinking, but as identity-priming before behavior.",
    stat: "A meta-analysis of 144 experimental tests found self-affirmation had reliable positive effects on behavior change (effect size d = 0.32).",
    source: "Self-Affirmation Meta-Analysis — PubMed",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/25133846/",
    icon: "⚡",
    countTarget: 144,
    placement: []
  },
  {
    id: "visualization",
    category: "Vision + Obstacles",
    categoryColor: "pink",
    headline: "See the future. Spot the obstacle. Script the response. Then move.",
    appLine: "Mental contrasting — combining vision with obstacle planning — is one of the most research-validated tools for goal attainment.",
    stat: "A meta-analysis found mental contrasting with implementation intentions improved goal attainment with a small-to-medium effect (g = 0.336) — outperforming pure positive visualization.",
    source: "Mental Contrasting + Implementation Intentions Meta-Analysis",
    sourceUrl: "https://www.researchgate.net/publication/351524219",
    icon: "🔭",
    countTarget: 336,
    placement: []
  }
];

export function getResearchById(id) {
  return RESEARCH_BANK.find((r) => r.id === id) || null;
}

export function getResearchByPlacement(componentName) {
  return RESEARCH_BANK.filter((r) => r.placement.includes(componentName));
}
