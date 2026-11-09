import type {
  ActivityItem,
  AnswerValue,
  Profile,
  Question,
  QuestionOption,
  Survey,
  SurveyResponse,
  SurveyStoreState,
} from "@/types/domain";
import { startOfUtcDay } from "@/lib/utils";

const DAY = 86_400_000;
const HOUR = 3_600_000;
const MINUTE = 60_000;

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

const now = new Date();
const dayStart = startOfUtcDay(now);

function isoAt(daysAgo: number, hour = 10, minute = 0): string {
  return new Date(dayStart - daysAgo * DAY + hour * HOUR + minute * MINUTE).toISOString();
}

function options(...labels: string[]): QuestionOption[] {
  return labels.map((label, index) => ({ id: `opt_${index + 1}`, label }));
}

function mc(
  id: string,
  title: string,
  optionLabels: string[],
  required = true,
  description?: string,
): Question {
  return { id, type: "single_choice", title, required, description, options: options(...optionLabels) };
}

function multi(
  id: string,
  title: string,
  optionLabels: string[],
  required = true,
  description?: string,
): Question {
  return { id, type: "multiple_choice", title, required, description, options: options(...optionLabels) };
}

function text(id: string, title: string, required = true, description?: string): Question {
  return { id, type: "long_answer", title, required, description, options: [] };
}

const agreeScale = ["Strongly agree", "Agree", "Neutral", "Disagree", "Strongly disagree"];
const satisfactionScale = ["Very satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very dissatisfied"];

export const seedSurveys: Survey[] = [
  {
    id: "srv_cxp",
    slug: "customer-experience-pulse",
    title: "Customer Experience Pulse",
    description:
      "A short monthly check-in on how customers feel about working with us — and where we can make their day lighter.",
    status: "published",
    category: "Customer experience",
    questions: [
      mc("q_cxp_1", "Overall, how satisfied are you with your experience?", satisfactionScale),
      mc("q_cxp_2", "How easy was it to get help when you needed it?", [
        "Extremely easy",
        "Easy",
        "Neither easy nor hard",
        "Difficult",
        "I did not ask for help",
      ]),
      mc("q_cxp_3", "Which part of the experience could we improve most?", [
        "Onboarding",
        "Support response time",
        "Product reliability",
        "Pricing clarity",
        "Something else",
      ]),
      text("q_cxp_4", "What would make your day-to-day easier?"),
      mc("q_cxp_5", "How likely are you to recommend us to a colleague?", [
        "Extremely likely",
        "Likely",
        "Neutral",
        "Unlikely",
        "Extremely unlikely",
      ]),
      text("q_cxp_6", "Anything else you'd like us to know?", false),
    ],
    theme: {
      accent: "#0d5947",
      showProgress: true,
      collectEmail: true,
      thankYouTitle: "Thank you for helping us improve.",
      thankYouMessage: "Your feedback goes straight to our customer team. We read every response.",
    },
    createdAt: isoAt(118, 9),
    updatedAt: isoAt(2, 16, 24),
    publishedAt: isoAt(112, 11),
    closedAt: null,
  },
  {
    id: "srv_pdi",
    slug: "product-discovery-interviews",
    title: "Product Discovery Interviews",
    description:
      "Open-ended questions for our research interviews, designed to understand the jobs people are trying to get done.",
    status: "published",
    category: "Product research",
    questions: [
      text("q_pdi_1", "What were you trying to accomplish today?"),
      text("q_pdi_2", "How do you currently solve this problem?"),
      mc("q_pdi_3", "Which of these is most frustrating?", [
        "Finding the right data",
        "Switching between tools",
        "Getting team buy-in",
        "Reporting results",
      ]),
      mc("q_pdi_4", "How often do you need this?", ["Daily", "Weekly", "Monthly", "Occasionally"]),
      text("q_pdi_5", "What would a great solution look like?"),
    ],
    theme: {
      accent: "#46697c",
      showProgress: true,
      collectEmail: false,
      thankYouTitle: "Thanks for sharing your perspective.",
      thankYouMessage: "Your answers help us decide what to build next. We appreciate your time.",
    },
    createdAt: isoAt(96, 14),
    updatedAt: isoAt(9, 10, 12),
    publishedAt: isoAt(92, 15),
    closedAt: null,
  },
  {
    id: "srv_brand",
    slug: "brand-perception-2026",
    title: "2026 Brand Perception Study",
    description:
      "An annual listening exercise to understand how the market describes us, remembers us, and expects us to show up.",
    status: "draft",
    category: "Brand",
    questions: [
      text("q_brand_1", "When you hear our name, what comes to mind?"),
      mc("q_brand_2", "How would you describe us to a colleague?", [
        "Innovative",
        "Reliable",
        "Premium",
        "Approachable",
        "Hard to pin down",
      ]),
      mc("q_brand_3", "How did you first hear about us?", [
        "A referral",
        "Search",
        "Social media",
        "An event",
        "A podcast",
      ]),
      text("q_brand_4", "Complete this sentence: We are the ___ choice for teams who want to ___."),
      text("q_brand_5", "What should we never become?", false),
    ],
    theme: {
      accent: "#8a5a3c",
      showProgress: true,
      collectEmail: false,
      thankYouTitle: "Thank you for your perspective.",
      thankYouMessage: "Your input will shape how we present ourselves in the year ahead.",
    },
    createdAt: isoAt(32, 13),
    updatedAt: isoAt(1, 11, 8),
    publishedAt: null,
    closedAt: null,
  },
  {
    id: "srv_onboarding",
    slug: "onboarding-feedback",
    title: "Onboarding Feedback",
    description:
      "We want the first 15 minutes in SurveyLand to feel effortless. Tell us what helped and what got in the way.",
    status: "published",
    category: "Product experience",
    questions: [
      mc("q_onb_1", "How long did it take to get set up?", [
        "Under 10 minutes",
        "10–30 minutes",
        "30–60 minutes",
        "More than an hour",
      ]),
      mc("q_onb_2", "Which step felt slowest?", [
        "Creating an account",
        "Inviting teammates",
        "Connecting data",
        "Building the first survey",
      ]),
      text("q_onb_3", "What did you want to do first?"),
      text("q_onb_4", "What would have made setup easier?"),
      mc("q_onb_5", "Did you feel confident after onboarding?", [
        "Completely confident",
        "Mostly confident",
        "Not quite yet",
      ]),
    ],
    theme: {
      accent: "#b07d1a",
      showProgress: true,
      collectEmail: true,
      thankYouTitle: "That's exactly what we needed.",
      thankYouMessage: "We review onboarding feedback every Friday. Thank you for making it better.",
    },
    createdAt: isoAt(74, 10),
    updatedAt: isoAt(4, 9, 40),
    publishedAt: isoAt(70, 10),
    closedAt: null,
  },
  {
    id: "srv_engagement",
    slug: "employee-engagement-q4",
    title: "Employee Engagement Q4",
    description:
      "A confidential quarterly pulse for the whole company. Themes are shared openly; individual answers are never attributed.",
    status: "closed",
    category: "People",
    questions: [
      mc("q_eng_1", "I feel energized by my work most days.", agreeScale),
      mc("q_eng_2", "I have the tools I need to do my best work.", agreeScale),
      mc("q_eng_3", "Recognition for good work happens at the right moments.", agreeScale),
      text("q_eng_4", "What should we protect as we grow?"),
      text("q_eng_5", "What should we change?"),
      mc("q_eng_6", "How would you rate your work-life balance?", [
        "Excellent",
        "Good",
        "It varies",
        "Needs attention",
      ]),
      text("q_eng_7", "One thing leadership could do better?", false),
    ],
    theme: {
      accent: "#5f6b3a",
      showProgress: true,
      collectEmail: false,
      thankYouTitle: "Your voice matters.",
      thankYouMessage: "The leadership team will share the themes in the next all-hands.",
    },
    createdAt: isoAt(152, 8),
    updatedAt: isoAt(46, 17),
    publishedAt: isoAt(148, 9),
    closedAt: isoAt(44, 18),
  },
  {
    id: "srv_usability",
    slug: "website-usability-test",
    title: "Website Usability Test",
    description:
      "A five-minute unmoderated test for the refreshed marketing site. We are looking for honest first impressions.",
    status: "draft",
    category: "Design",
    questions: [
      text("q_usab_1", "What was the first thing you noticed?"),
      mc("q_usab_2", "Could you find the pricing page?", [
        "Easily",
        "With a little effort",
        "I could not find it",
      ]),
      text("q_usab_3", "What felt confusing?"),
      mc("q_usab_4", "How would you rate the visual design?", [
        "Excellent",
        "Good",
        "Average",
        "Poor",
      ]),
      text("q_usab_5", "What almost stopped you from signing up?", false),
    ],
    theme: {
      accent: "#a34a32",
      showProgress: true,
      collectEmail: false,
      thankYouTitle: "Thanks for testing with us.",
      thankYouMessage: "We will use this to make the next version clearer for everyone.",
    },
    createdAt: isoAt(18, 15),
    updatedAt: isoAt(0, 9, 2),
    publishedAt: null,
    closedAt: null,
  },
  {
    id: "srv_event",
    slug: "event-attendee-survey",
    title: "Event Attendee Survey",
    description:
      "A thoughtful wrap-up for everyone who joined us in person. Tell us what to keep and what to rethink.",
    status: "closed",
    category: "Events",
    questions: [
      mc("q_evt_1", "Which session was most valuable?", [
        "Opening keynote",
        "Product roadmap",
        "Customer panel",
        "Hands-on workshop",
      ]),
      mc("q_evt_2", "The pacing was right for me.", agreeScale),
      mc("q_evt_3", "Where did you hear about the event?", [
        "Invitation",
        "Social media",
        "A colleague",
        "Our newsletter",
      ]),
      text("q_evt_4", "What should we add next year?"),
    ],
    theme: {
      accent: "#c94e1f",
      showProgress: true,
      collectEmail: true,
      thankYouTitle: "Safe travels, and thank you.",
      thankYouMessage: "We will send a short recap soon. See you at the next one.",
    },
    createdAt: isoAt(68, 9),
    updatedAt: isoAt(30, 12),
    publishedAt: isoAt(64, 9),
    closedAt: isoAt(28, 17),
  },
  {
    id: "srv_features",
    slug: "feature-prioritization-board",
    title: "Feature Prioritization Board",
    description:
      "Help us choose what to build next. Every answer is read by the product team before planning begins.",
    status: "published",
    category: "Product research",
    questions: [
      mc("q_feat_1", "Which capability would help you most this quarter?", [
        "Automated reports",
        "Advanced branching",
        "Team permissions",
        "Integrations",
        "AI summaries",
      ]),
      mc("q_feat_2", "How much time would that save you weekly?", [
        "Less than an hour",
        "1–3 hours",
        "3–5 hours",
        "More than 5 hours",
      ]),
      text("q_feat_3", "What workaround do you use today?"),
      multi("q_feat_4", "Which integrations matter most?", [
        "Slack",
        "Notion",
        "HubSpot",
        "Salesforce",
        "Google Sheets",
      ]),
      mc("q_feat_5", "How urgently do you need this?", [
        "This month",
        "This quarter",
        "Next quarter",
        "Just exploring",
      ]),
      mc("q_feat_6", "Who else would benefit?", [
        "My team",
        "My department",
        "The whole company",
        "Our clients",
      ]),
    ],
    theme: {
      accent: "#0d5947",
      showProgress: true,
      collectEmail: true,
      thankYouTitle: "Your vote is counted.",
      thankYouMessage: "We will share what we learned — and what we are building next — in the product digest.",
    },
    createdAt: isoAt(44, 11),
    updatedAt: isoAt(3, 14, 35),
    publishedAt: isoAt(40, 11),
    closedAt: null,
  },
];

const textPools: Record<string, string[]> = {
  q_cxp_4: [
    "A single view of every open request, so I do not have to stitch updates together myself.",
    "Faster loading on large surveys and clearer export options would genuinely change my week.",
    "More automation around reminders. I spend too much time chasing responses manually.",
    "Better mobile support for reviewing results between meetings.",
    "Clearer permissions. It is hard to know who can edit what.",
    "Honestly, things are good. Keep the support team exactly as they are.",
  ],
  q_cxp_6: [
    "The new dashboard is a big step forward. Please keep the human tone in your emails.",
    "I would love a native integration with the rest of our stack.",
    "Nothing major — just keep listening like this.",
    "More sample templates for research studies would help us get started faster.",
  ],
  q_pdi_1: [
    "I needed to pull together a quarterly readout for our leadership team in under an hour.",
    "Understand why customers are dropping off before their second purchase.",
    "Give the team one place to see what we have learned from customer calls.",
    "Replace the spreadsheet we have been using to track research requests.",
    "Prepare for a renewal conversation with our largest account.",
  ],
  q_pdi_2: [
    "A messy combination of spreadsheets, Notion docs, and screenshots in Slack.",
    "We run interviews manually and synthesize notes afterward in a shared document.",
    "Our analyst builds a report each month and we circulate a PDF.",
    "Honestly, we mostly rely on memory and a few recurring conversations.",
    "We use a competitor, but the reporting feels rigid for our workflow.",
  ],
  q_pdi_5: [
    "Something that captures the conversation and turns it into themes without losing the nuance.",
    "A living research repository the whole team can search.",
    "Fewer tools, clearer next steps, and a summary I can share without editing for an hour.",
    "A guided workflow with templates that match how our team already thinks.",
    "Fast setup and reports that look like something I would be proud to present.",
  ],
  q_brand_1: [
    "Thoughtful, calm, and a little more considered than the usual software company.",
    "The team that actually reads the comments. I remember the personal follow-up.",
    "Clean and trustworthy, but I could not describe exactly what you sell.",
    "A premium tool with a warm voice. Not corporate.",
    "The survey product our research team keeps recommending.",
  ],
  q_brand_4: [
    "We are the thoughtful choice for teams who want to actually listen.",
    "We are the calm choice for teams who want to move with confidence.",
    "We are the practical choice for teams who want to understand their customers.",
    "We are the human choice for teams who want to ask better questions.",
  ],
  q_brand_5: [
    "Another dashboard that looks impressive but makes me feel behind.",
    "A brand that is all personality and no substance.",
    "One more tool that ignores the people answering the questions.",
    "Corporate, cold, and impossible to talk to.",
  ],
  q_onb_3: [
    "Build a customer pulse survey and send it to a pilot group.",
    "Invite my team and set permissions before our weekly meeting.",
    "See what the reports look like before I invested more time.",
    "Import an existing survey and see how it was structured.",
    "Explore templates to find a format that fit our research practice.",
  ],
  q_onb_4: [
    "A short sample survey already populated would have helped me understand the possibilities.",
    "Clearer guidance on the difference between drafts and published surveys.",
    "I wanted to invite teammates before building anything — that order would have helped.",
    "An inline explanation of how responses get grouped into themes.",
    "The setup was quick. A checklist for the first week would have been useful.",
  ],
  q_eng_4: [
    "The generosity with context. Leadership explains the why before the what.",
    "The Friday demos. They keep the team connected across time zones.",
    "Our appetite for questions, even the uncomfortable ones.",
    "The flexibility we give people to do focused work.",
    "The kindness in feedback. It is direct without being unkind.",
  ],
  q_eng_5: [
    "Meetings could be shorter and more intentional.",
    "We need clearer ownership when projects span teams.",
    "Promotion criteria should be more transparent.",
    "Fewer tools. I spend too much time switching context.",
    "We should protect focus time during the middle of the week.",
  ],
  q_eng_7: [
    "Share the decisions that come out of these surveys, including what will not change.",
    "Say no more clearly and explain the trade-off.",
    "Keep investing in managers. The best teams have great ones.",
    "Protect the team from unnecessary urgency.",
  ],
  q_usab_1: [
    "The warm background and the big headline. It felt different from other SaaS sites.",
    "The product screenshot in the hero — I understood what it did quickly.",
    "A lot of navigation options. It took a moment to know where to start.",
    "The example survey. I immediately wanted to click it.",
    "The color palette. Calm, but I was not sure where the main action was.",
  ],
  q_usab_3: [
    "The difference between the two primary buttons was not obvious at first.",
    "I expected pricing in the main navigation and looked twice.",
    "The feature section is dense. I skimmed it rather than read it.",
    "Some labels use language I would not use with my own team.",
    "Nothing major. The flow was clearer than I expected.",
  ],
  q_usab_5: [
    "I was not sure whether the demo required a credit card.",
    "The sign-up form asked for more than I expected upfront.",
    "I wanted to see an example report before creating an account.",
    "Nothing stopped me. The demo link was enough.",
  ],
  q_evt_4: [
    "More hands-on time and fewer slides.",
    "A session for teams at earlier stages. Some of the content assumed a lot.",
    "Better breaks and a quieter space for conversations.",
    "Recordings, so my teammates who could not attend can catch up.",
  ],
  q_feat_3: [
    "We export to a spreadsheet and build charts manually every Monday.",
    "Our team copies answers into a shared doc and highlights themes by hand.",
    "We screenshot charts and paste them into presentations.",
    "We use a separate BI tool for anything beyond the built-in reports.",
    "A lot of copy and paste, honestly.",
  ],
};

const firstNames = [
  "Maya", "Leo", "Priya", "Noah", "Sofia", "Ethan", "Amara", "Lucas", "Zara", "Mateo",
  "Iris", "Kai", "Nora", "Hugo", "Elena", "Theo", "Mina", "Oscar", "Ava", "Ravi",
  "Clara", "Jonah", "Yara", "Felix", "Layla", "Owen", "Isla", "Marcus", "Ines", "Sam",
  "Nina", "Adrian", "Cora", "Eli", "Mae", "Rafael", "Tara", "Ben", "Nadia", "Caleb",
];
const lastNames = [
  "Okafor", "Fischer", "Raman", "Bennett", "Costa", "Hughes", "Osei", "Silva", "Haddad", "Torres",
  "Lindqvist", "Nakamura", "Bauer", "Moreau", "Petrova", "Walsh", "Kim", "Dubois", "Reyes", "Shah",
  "Novak", "Anders", "Aziz", "Weber", "Hansen", "Price", "Murphy", "Tanaka", "Rossi", "Clarke",
];

const seedMeta: Array<{ surveyId: string; count: number; openDays: number; seed: number }> = [
  { surveyId: "srv_cxp", count: 384, openDays: 90, seed: 11 },
  { surveyId: "srv_pdi", count: 96, openDays: 80, seed: 23 },
  { surveyId: "srv_onboarding", count: 212, openDays: 60, seed: 37 },
  { surveyId: "srv_engagement", count: 148, openDays: 42, seed: 41 },
  { surveyId: "srv_event", count: 89, openDays: 26, seed: 53 },
  { surveyId: "srv_features", count: 267, openDays: 36, seed: 67 },
];

function buildResponses(): SurveyResponse[] {
  const responses: SurveyResponse[] = [];

  seedMeta.forEach(({ surveyId, count, openDays, seed }) => {
    const survey = seedSurveys.find((item) => item.id === surveyId);
    if (!survey) return;
    const random = mulberry32(seed);
    const namePoolOffset = Math.floor(random() * 29);

    for (let index = 0; index < count; index += 1) {
      const daysAgo = Math.floor((1 - Math.pow(random(), 0.72)) * openDays);
      const hour = 6 + Math.floor(random() * 16);
      const minute = Math.floor(random() * 60);
      const submittedAt = isoAt(daysAgo, hour, minute);
      const completionRoll = random();
      const completion =
        completionRoll > 0.88
          ? 100
          : completionRoll > 0.28
            ? 86 + Math.floor(random() * 13)
            : 64 + Math.floor(random() * 20);
      const answers: Record<string, AnswerValue> = {};

      survey.questions.forEach((question, questionIndex) => {
        const lastThird = questionIndex >= survey.questions.length - 2;
        const skip = !question.required && (random() < 0.18 || (completion < 90 && lastThird));
        if (skip) return;

        if (question.type === "multiple_choice") {
          const pickCount = 1 + Math.floor(random() * Math.min(3, question.options.length));
          const picks = new Set<string>();
          while (picks.size < pickCount && question.options.length > 0) {
            const bias = 1.35 + random() * 0.9;
            const weighted = Math.pow(random(), bias);
            const optionIndex = Math.min(
              question.options.length - 1,
              Math.floor(weighted * question.options.length),
            );
            const label = question.options[optionIndex]?.label;
            if (label) picks.add(label);
          }
          answers[question.id] = Array.from(picks);
        } else if (question.type === "single_choice") {
          const bias = 1.35 + random() * 0.9;
          const weighted = Math.pow(random(), bias);
          const optionIndex = Math.min(
            question.options.length - 1,
            Math.floor(weighted * question.options.length),
          );
          answers[question.id] = question.options[optionIndex]?.label ?? question.options[0]?.label;
        } else {
          const pool = textPools[question.id];
          answers[question.id] = pool
            ? pool[Math.floor(random() * pool.length)]
            : "The experience has been clear and thoughtful so far.";
        }
      });

      const nameIndex = (index + namePoolOffset * 7) % firstNames.length;
      const lastIndex = (index * 3 + namePoolOffset) % lastNames.length;
      const first = firstNames[nameIndex];
      const last = lastNames[lastIndex];
      const email =
        survey.theme.collectEmail && random() > 0.14
          ? `${first.toLowerCase()}.${last.toLowerCase()}@${["northwind.studio", "lumen.co", "fieldwork.io", "arcadia.team", "kitehq.com"][Math.floor(random() * 5)]}`
          : null;

      const deviceRoll = random();
      const device = deviceRoll > 0.45 ? "Mobile" : deviceRoll > 0.07 ? "Desktop" : "Tablet";

      responses.push({
        id: `rsp_${surveyId.replace("srv_", "")}_${String(index + 1).padStart(4, "0")}`,
        surveyId,
        submittedAt,
        name: `${first} ${last}`,
        email,
        answers,
        completion,
        durationSeconds: 48 + Math.floor(random() * 320),
        device,
      });
    }
  });

  return responses.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}

export const seedResponses: SurveyResponse[] = buildResponses();

export const seedActivity: ActivityItem[] = [
  {
    id: "act_1",
    type: "response",
    surveyId: "srv_cxp",
    surveyTitle: "Customer Experience Pulse",
    message: "received a new response from Maya Okafor",
    at: isoAt(0, 8, 42),
  },
  {
    id: "act_2",
    type: "edited",
    surveyId: "srv_features",
    surveyTitle: "Feature Prioritization Board",
    message: "was updated with a clearer question description",
    at: isoAt(0, 7, 15),
  },
  {
    id: "act_3",
    type: "response",
    surveyId: "srv_features",
    surveyTitle: "Feature Prioritization Board",
    message: "crossed 260 responses this month",
    at: isoAt(1, 16, 30),
  },
  {
    id: "act_4",
    type: "published",
    surveyId: "srv_onboarding",
    surveyTitle: "Onboarding Feedback",
    message: "was published to the public link",
    at: isoAt(2, 11, 20),
  },
  {
    id: "act_5",
    type: "response",
    surveyId: "srv_onboarding",
    surveyTitle: "Onboarding Feedback",
    message: "received a new response from Leo Fischer",
    at: isoAt(2, 9, 5),
  },
  {
    id: "act_6",
    type: "created",
    surveyId: "srv_usability",
    surveyTitle: "Website Usability Test",
    message: "was created as a new draft",
    at: isoAt(3, 14, 45),
  },
  {
    id: "act_7",
    type: "closed",
    surveyId: "srv_engagement",
    surveyTitle: "Employee Engagement Q4",
    message: "was closed after 148 responses",
    at: isoAt(44, 18),
  },
  {
    id: "act_8",
    type: "duplicated",
    surveyId: "srv_brand",
    surveyTitle: "2026 Brand Perception Study",
    message: "was duplicated from last year's study",
    at: isoAt(5, 10),
  },
];

export const seedProfile: Profile = {
  name: "Amara Osei",
  email: "amara@northwind.studio",
  company: "Northwind Studio",
  role: "Head of Research",
  timezone: "Europe/London",
  avatar: null,
  preferences: {
    weeklyDigest: true,
    newResponses: true,
    productUpdates: false,
    reduceMotion: false,
  },
};

export function createSeedState(): SurveyStoreState {
  return {
    surveys: seedSurveys.map((survey) => ({
      ...survey,
      questions: survey.questions.map((question) => ({
        ...question,
        options: question.options.map((option) => ({ ...option })),
      })),
      theme: { ...survey.theme },
    })),
    responses: seedResponses.map((response) => ({
      ...response,
      answers: { ...response.answers },
    })),
    activity: seedActivity.map((item) => ({ ...item })),
    hydrated: false,
  };
}
