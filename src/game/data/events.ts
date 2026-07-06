import type { GameEvent } from "../types";

export const events = [
  {
    id: "investor-moat-question",
    title: "Investor Asks Where The Moat Is",
    category: "funding",
    trigger: [{ metric: "valuation", op: ">=", value: 15_000_000 }],
    choices: [
      {
        id: "show-enterprise-workflows",
        label: "Show sticky enterprise workflows",
        effects: [
          { metric: "pmf", delta: 4 },
          { metric: "boardPressure", delta: -2 },
        ],
        log: "The moat answer shifts from model mysticism to renewal pain.",
      },
      {
        id: "promise-frontier-model",
        label: "Promise frontier model parity",
        effects: [
          { metric: "marketHeat", delta: 5 },
          { metric: "computeCost", delta: 4 },
        ],
        log: "The room likes the ambition and ignores the power bill.",
      },
    ],
  },
  {
    id: "impossible-enterprise-contract",
    title: "Impossible Enterprise Contract",
    category: "customer",
    trigger: [{ metric: "mrr", op: ">=", value: 200_000 }],
    choices: [
      {
        id: "accept-custom-work",
        label: "Accept the custom scope",
        effects: [
          { metric: "arr", delta: 1_000_000 },
          { metric: "techDebt", delta: 6 },
          { metric: "morale", delta: -3 },
        ],
        log: "Revenue arrives wearing a services disguise.",
      },
      {
        id: "hold-product-line",
        label: "Hold the product line",
        effects: [
          { metric: "productQuality", delta: 4 },
          { metric: "boardPressure", delta: 3 },
        ],
        log: "The sales team mourns, but the roadmap survives.",
      },
    ],
  },
  {
    id: "deepduck-open-source-shock",
    title: "DeepDuck Releases A Cheap Model",
    category: "giant",
    trigger: [
      { metric: "modelPower", op: "<=", value: 55 },
      { metric: "marketHeat", op: ">=", value: 65 },
    ],
    choices: [
      {
        id: "wrap-with-workflow",
        label: "Wrap it with workflow value",
        effects: [
          { metric: "productQuality", delta: 5 },
          { metric: "pmf", delta: 3 },
        ],
        log: "The team sells outcomes while Twitter argues benchmarks.",
      },
      {
        id: "start-benchmark-war",
        label: "Start a benchmark war",
        effects: [
          { metric: "modelPower", delta: 5 },
          { metric: "computeCost", delta: 5 },
          { metric: "founderHealth", delta: -4 },
        ],
        log: "The leaderboard moves. So does the burn rate.",
      },
    ],
  },
  {
    id: "core-researcher-triple-offer",
    title: "Core Researcher Gets Triple Offer",
    category: "employee",
    trigger: [{ metric: "modelPower", op: ">=", value: 35 }],
    choices: [
      {
        id: "refresh-options",
        label: "Refresh options",
        effects: [
          { metric: "morale", delta: 5 },
          { metric: "founderEquity", delta: -2 },
        ],
        log: "Retention improves after everyone recalculates ownership.",
      },
      {
        id: "let-them-go",
        label: "Let them go",
        effects: [
          { metric: "modelPower", delta: -6 },
          { metric: "cash", delta: 400_000 },
        ],
        log: "The farewell lunch is polite and strategically devastating.",
      },
    ],
  },
  {
    id: "board-suggests-professional-ceo",
    title: "Board Suggests Professional CEO",
    category: "funding",
    trigger: [{ metric: "boardPressure", op: ">=", value: 45 }],
    choices: [
      {
        id: "hire-coo",
        label: "Hire a heavyweight COO",
        effects: [
          { metric: "boardPressure", delta: -8 },
          { metric: "cash", delta: -800_000 },
        ],
        log: "The board gets process without taking the founder's badge.",
      },
      {
        id: "fight-the-board",
        label: "Fight the board",
        effects: [
          { metric: "founderEquity", delta: 2 },
          { metric: "boardPressure", delta: 8 },
          { metric: "founderHealth", delta: -5 },
        ],
        log: "Control is defended at the cost of another sleepless week.",
      },
    ],
  },
  {
    id: "green-furnace-waitlist",
    title: "Green Furnace Opens A GPU Waitlist",
    category: "tech",
    trigger: [{ metric: "computeSupply", op: "<=", value: 25 }],
    choices: [
      {
        id: "prepay-capacity",
        label: "Prepay for capacity",
        effects: [
          { metric: "computeSupply", delta: 12 },
          { metric: "cash", delta: -1_000_000 },
        ],
        log: "The cluster slot is secured, and finance quietly ages.",
      },
      {
        id: "optimize-inference",
        label: "Optimize inference first",
        effects: [
          { metric: "grossMargin", delta: 5 },
          { metric: "modelPower", delta: -2 },
        ],
        log: "Smaller models do the job, minus the bragging rights.",
      },
    ],
  },
  {
    id: "byteplanet-traffic-trial",
    title: "BytePlanet Offers Traffic Trial",
    category: "giant",
    trigger: [{ metric: "reputation", op: ">=", value: 35 }],
    choices: [
      {
        id: "take-traffic",
        label: "Take the traffic",
        effects: [
          { metric: "marketHeat", delta: 8 },
          { metric: "pmf", delta: 2 },
          { metric: "complianceRisk", delta: 3 },
        ],
        log: "Users flood in, along with a strategic integration checklist.",
      },
      {
        id: "stay-independent",
        label: "Stay independent",
        effects: [
          { metric: "reputation", delta: 3 },
          { metric: "boardPressure", delta: 3 },
        ],
        log: "Independence is celebrated by people who do not need growth this quarter.",
      },
    ],
  },
  {
    id: "cloudsoft-pluginization",
    title: "CloudSoft Wants A Plugin",
    category: "giant",
    trigger: [{ metric: "productQuality", op: ">=", value: 40 }],
    choices: [
      {
        id: "build-plugin",
        label: "Build the plugin",
        effects: [
          { metric: "arr", delta: 700_000 },
          { metric: "techDebt", delta: 4 },
        ],
        log: "Distribution improves in exchange for another platform dependency.",
      },
      {
        id: "push-direct-sales",
        label: "Push direct sales",
        effects: [
          { metric: "pmf", delta: 3 },
          { metric: "runway", delta: -1 },
        ],
        log: "The company keeps margin and loses the shortcut.",
      },
    ],
  },
  {
    id: "moralmachine-safety-review",
    title: "MoralMachine Requests Safety Review",
    category: "regulation",
    trigger: [{ metric: "reputation", op: ">=", value: 50 }],
    choices: [
      {
        id: "cooperate",
        label: "Cooperate publicly",
        effects: [
          { metric: "complianceRisk", delta: -8 },
          { metric: "productQuality", delta: -2 },
        ],
        log: "The report is dull, which is exactly the point.",
      },
      {
        id: "dismiss-review",
        label: "Dismiss it as theater",
        effects: [
          { metric: "marketHeat", delta: 3 },
          { metric: "complianceRisk", delta: 9 },
        ],
        log: "The founder wins a quote tweet and loses regulatory oxygen.",
      },
    ],
  },
  {
    id: "sales-promised-private-deployment",
    title: "Sales Promised Private Deployment",
    category: "customer",
    trigger: [{ metric: "arr", op: ">=", value: 500_000 }],
    choices: [
      {
        id: "staff-war-room",
        label: "Staff a delivery war room",
        effects: [
          { metric: "arr", delta: 800_000 },
          { metric: "morale", delta: -5 },
          { metric: "techDebt", delta: 4 },
        ],
        log: "The customer is delighted; engineering is learning contract law.",
      },
      {
        id: "renegotiate-cloud",
        label: "Renegotiate to cloud",
        effects: [
          { metric: "grossMargin", delta: 4 },
          { metric: "reputation", delta: -2 },
        ],
        log: "The scope returns to reality after a tense procurement call.",
      },
    ],
  },
  {
    id: "cfo-finds-recognition-risk",
    title: "CFO Finds Revenue Recognition Risk",
    category: "funding",
    trigger: [{ metric: "arr", op: ">=", value: 2_000_000 }],
    choices: [
      {
        id: "clean-books",
        label: "Clean the books",
        effects: [
          { metric: "boardPressure", delta: -5 },
          { metric: "arr", delta: -300_000 },
        ],
        log: "The ARR slide shrinks, but diligence stops sweating.",
      },
      {
        id: "defer-problem",
        label: "Defer the problem",
        effects: [
          { metric: "marketHeat", delta: 3 },
          { metric: "complianceRisk", delta: 6 },
        ],
        log: "The metric survives the quarter and poisons the next one.",
      },
    ],
  },
  {
    id: "overseas-bd-asks-for-budget",
    title: "Overseas BD Asks For Budget",
    category: "global",
    trigger: [{ metric: "globalReadiness", op: ">=", value: 20 }],
    choices: [
      {
        id: "fund-roadshow",
        label: "Fund the roadshow",
        effects: [
          { metric: "globalReadiness", delta: 7 },
          { metric: "cash", delta: -600_000 },
        ],
        log: "The pipeline grows across airports and hotel lobbies.",
      },
      {
        id: "stay-remote",
        label: "Stay remote",
        effects: [
          { metric: "runway", delta: 1 },
          { metric: "globalReadiness", delta: -2 },
        ],
        log: "The budget survives; the overseas story remains theoretical.",
      },
    ],
  },
  {
    id: "eu-customer-asks-data-lineage",
    title: "EU Customer Asks Data Lineage",
    category: "regulation",
    trigger: [{ metric: "globalReadiness", op: ">=", value: 30 }],
    choices: [
      {
        id: "build-lineage",
        label: "Build lineage controls",
        effects: [
          { metric: "complianceRisk", delta: -6 },
          { metric: "globalReadiness", delta: 5 },
          { metric: "productQuality", delta: -1 },
        ],
        log: "The spreadsheet of datasets becomes a product feature.",
      },
      {
        id: "skip-eu",
        label: "Skip the EU for now",
        effects: [
          { metric: "arr", delta: -500_000 },
          { metric: "runway", delta: 1 },
        ],
        log: "Europe is postponed until the lawyers are less expensive.",
      },
    ],
  },
  {
    id: "middle-east-poc-marathon",
    title: "Middle East POC Marathon",
    category: "global",
    trigger: [{ metric: "globalReadiness", op: ">=", value: 25 }],
    choices: [
      {
        id: "send-founders",
        label: "Send founders",
        effects: [
          { metric: "arr", delta: 1_200_000 },
          { metric: "founderHealth", delta: -7 },
          { metric: "globalReadiness", delta: 4 },
        ],
        log: "The POC advances through meetings that start at midnight Beijing time.",
      },
      {
        id: "qualify-harder",
        label: "Qualify harder",
        effects: [
          { metric: "grossMargin", delta: 3 },
          { metric: "marketHeat", delta: -2 },
        ],
        log: "The team says no to prestige and yes to sleeping occasionally.",
      },
    ],
  },
  {
    id: "us-investor-asks-global-story",
    title: "US Investor Asks Global Story",
    category: "funding",
    trigger: [{ metric: "marketHeat", op: ">=", value: 70 }],
    choices: [
      {
        id: "pitch-global",
        label: "Pitch global expansion",
        effects: [
          { metric: "valuation", delta: 8_000_000 },
          { metric: "boardPressure", delta: 4 },
        ],
        log: "The global slide works better than the operating plan behind it.",
      },
      {
        id: "defend-china-depth",
        label: "Defend China depth",
        effects: [
          { metric: "pmf", delta: 4 },
          { metric: "valuation", delta: -2_000_000 },
        ],
        log: "The story is less fashionable and more believable.",
      },
    ],
  },
  {
    id: "employee-options-underwater",
    title: "Employee Options Are Underwater",
    category: "employee",
    trigger: [{ metric: "valuation", op: "<=", value: 8_000_000 }],
    choices: [
      {
        id: "reprice-options",
        label: "Reprice options",
        effects: [
          { metric: "morale", delta: 7 },
          { metric: "founderEquity", delta: -3 },
        ],
        log: "The team gets hope with a cap table footnote.",
      },
      {
        id: "sell-mission",
        label: "Sell the mission harder",
        effects: [
          { metric: "morale", delta: -5 },
          { metric: "cash", delta: 200_000 },
        ],
        log: "The mission talk lands about as well as unpaid overtime.",
      },
    ],
  },
  {
    id: "founder-health-warning",
    title: "Founder Health Warning",
    category: "health",
    trigger: [{ metric: "founderHealth", op: "<=", value: 45 }],
    choices: [
      {
        id: "delegate-week",
        label: "Delegate for a week",
        effects: [
          { metric: "founderHealth", delta: 10 },
          { metric: "boardPressure", delta: 2 },
        ],
        log: "The company survives a week without founder pings after midnight.",
      },
      {
        id: "push-through",
        label: "Push through",
        effects: [
          { metric: "marketHeat", delta: 3 },
          { metric: "founderHealth", delta: -8 },
        ],
        log: "The demo ships, and so does a calendar invite from the doctor.",
      },
    ],
  },
  {
    id: "demo-crashes-at-conference",
    title: "Demo Crashes At Conference",
    category: "pr",
    trigger: [{ metric: "reputation", op: ">=", value: 40 }],
    choices: [
      {
        id: "own-the-failure",
        label: "Own the failure",
        effects: [
          { metric: "reputation", delta: 2 },
          { metric: "productQuality", delta: 4 },
        ],
        log: "The postmortem earns more trust than the demo would have.",
      },
      {
        id: "blame-wifi",
        label: "Blame venue Wi-Fi",
        effects: [
          { metric: "reputation", delta: -5 },
          { metric: "boardPressure", delta: 3 },
        ],
        log: "Nobody believes the Wi-Fi story, including the Wi-Fi.",
      },
    ],
  },
  {
    id: "viral-pr-with-no-retention",
    title: "Viral PR With No Retention",
    category: "pr",
    trigger: [
      { metric: "marketHeat", op: ">=", value: 70 },
      { metric: "pmf", op: "<=", value: 35 },
    ],
    choices: [
      {
        id: "slow-growth-fix-core",
        label: "Slow growth and fix core use",
        effects: [
          { metric: "pmf", delta: 6 },
          { metric: "marketHeat", delta: -4 },
        ],
        log: "The graph looks less viral and more survivable.",
      },
      {
        id: "feed-the-hype",
        label: "Feed the hype",
        effects: [
          { metric: "reputation", delta: 5 },
          { metric: "boardPressure", delta: 5 },
          { metric: "techDebt", delta: 3 },
        ],
        log: "The launch gets articles, users, and a churn curve shaped like a cliff.",
      },
    ],
  },
  {
    id: "customer-prepayment-offer",
    title: "Customer Offers Prepayment",
    category: "customer",
    trigger: [{ metric: "productQuality", op: ">=", value: 45 }],
    choices: [
      {
        id: "take-prepay",
        label: "Take prepayment",
        effects: [
          { metric: "cash", delta: 1_200_000 },
          { metric: "boardPressure", delta: -2 },
          { metric: "techDebt", delta: 2 },
        ],
        log: "Cash arrives with a delivery clock attached.",
      },
      {
        id: "keep-standard-contract",
        label: "Keep standard contract",
        effects: [
          { metric: "grossMargin", delta: 3 },
          { metric: "arr", delta: 400_000 },
        ],
        log: "The deal is smaller, cleaner, and less likely to explode.",
      },
    ],
  },
  {
    id: "gpu-invoice-sticker-shock",
    title: "GPU Invoice Sticker Shock",
    category: "tech",
    trigger: [{ metric: "computeCost", op: ">=", value: 50 }],
    choices: [
      {
        id: "negotiate-credits",
        label: "Negotiate cloud credits",
        effects: [
          { metric: "cash", delta: 600_000 },
          { metric: "computeSupply", delta: 4 },
        ],
        log: "The vendor discounts the present and owns a piece of the future.",
      },
      {
        id: "cut-context-window",
        label: "Cut context window",
        effects: [
          { metric: "computeCost", delta: -7 },
          { metric: "productQuality", delta: -3 },
        ],
        log: "The model becomes cheaper and slightly more forgetful.",
      },
    ],
  },
  {
    id: "regulator-visits-office",
    title: "Regulator Visits The Office",
    category: "regulation",
    trigger: [{ metric: "complianceRisk", op: ">=", value: 60 }],
    choices: [
      {
        id: "open-records",
        label: "Open the records",
        effects: [
          { metric: "complianceRisk", delta: -10 },
          { metric: "founderHealth", delta: -3 },
        ],
        log: "The audit is painful but less painful than speculation.",
      },
      {
        id: "delay-response",
        label: "Delay the response",
        effects: [
          { metric: "complianceRisk", delta: 8 },
          { metric: "reputation", delta: -3 },
        ],
        log: "Delay converts paperwork into suspicion.",
      },
    ],
  },
  {
    id: "procurement-demands-local-deployment",
    title: "Procurement Demands Local Deployment",
    category: "customer",
    trigger: [{ metric: "arr", op: ">=", value: 1_000_000 }],
    choices: [
      {
        id: "launch-local-stack",
        label: "Launch local stack",
        effects: [
          { metric: "arr", delta: 900_000 },
          { metric: "grossMargin", delta: -5 },
        ],
        log: "The customer signs after turning SaaS into a hardware project.",
      },
      {
        id: "offer-premium-cloud",
        label: "Offer premium cloud",
        effects: [
          { metric: "grossMargin", delta: 4 },
          { metric: "pmf", delta: -2 },
        ],
        log: "The clean architecture is preserved for customers who can tolerate it.",
      },
    ],
  },
  {
    id: "model-benchmark-leak",
    title: "Model Benchmark Leaks",
    category: "pr",
    trigger: [{ metric: "modelPower", op: ">=", value: 45 }],
    choices: [
      {
        id: "publish-methodology",
        label: "Publish methodology",
        effects: [
          { metric: "reputation", delta: 5 },
          { metric: "complianceRisk", delta: -2 },
        ],
        log: "Transparency steals oxygen from the rumor cycle.",
      },
      {
        id: "deny-everything",
        label: "Deny everything",
        effects: [
          { metric: "marketHeat", delta: 4 },
          { metric: "reputation", delta: -4 },
        ],
        log: "The denial trends harder than the benchmark.",
      },
    ],
  },
  {
    id: "openmind-price-cut",
    title: "OpenMind Cuts API Prices",
    category: "giant",
    trigger: [{ metric: "grossMargin", op: "<=", value: 25 }],
    choices: [
      {
        id: "match-pricing",
        label: "Match pricing",
        effects: [
          { metric: "grossMargin", delta: -8 },
          { metric: "pmf", delta: 3 },
        ],
        log: "Customers applaud the discount as finance searches for a chair.",
      },
      {
        id: "sell-data-residency",
        label: "Sell data residency",
        effects: [
          { metric: "grossMargin", delta: 4 },
          { metric: "complianceRisk", delta: -3 },
        ],
        log: "The company competes on trust instead of a richer rival's price list.",
      },
    ],
  },
  {
    id: "campus-recruiting-backfires",
    title: "Campus Recruiting Backfires",
    category: "employee",
    trigger: [{ metric: "reputation", op: ">=", value: 45 }],
    choices: [
      {
        id: "mentor-juniors",
        label: "Mentor juniors properly",
        effects: [
          { metric: "morale", delta: 4 },
          { metric: "runway", delta: -1 },
        ],
        log: "The team gets talent, plus enough onboarding docs to frighten seniors.",
      },
      {
        id: "pause-campus",
        label: "Pause campus hiring",
        effects: [
          { metric: "productQuality", delta: 2 },
          { metric: "marketHeat", delta: -2 },
        ],
        log: "The company chooses fewer badges and fewer broken pull requests.",
      },
    ],
  },
  {
    id: "finance-flags-burn-multiple",
    title: "Finance Flags Burn Multiple",
    category: "funding",
    trigger: [{ metric: "runway", op: "<=", value: 6 }],
    choices: [
      {
        id: "freeze-hiring",
        label: "Freeze hiring",
        effects: [
          { metric: "runway", delta: 3 },
          { metric: "morale", delta: -4 },
        ],
        log: "Runway extends as every open role becomes a rumor.",
      },
      {
        id: "raise-bridge",
        label: "Raise a bridge",
        effects: [
          { metric: "cash", delta: 2_000_000 },
          { metric: "founderEquity", delta: -5 },
          { metric: "boardPressure", delta: 4 },
        ],
        log: "The bridge round works exactly like a bridge toll.",
      },
    ],
  },
  {
    id: "big-bank-security-review",
    title: "Big Bank Security Review",
    category: "customer",
    trigger: [{ metric: "arr", op: ">=", value: 3_000_000 }],
    choices: [
      {
        id: "pass-audit",
        label: "Invest in audit controls",
        effects: [
          { metric: "complianceRisk", delta: -7 },
          { metric: "arr", delta: 1_500_000 },
          { metric: "cash", delta: -500_000 },
        ],
        log: "Security review becomes a sales asset after weeks of controlled misery.",
      },
      {
        id: "walk-away",
        label: "Walk away",
        effects: [
          { metric: "runway", delta: 1 },
          { metric: "reputation", delta: -2 },
        ],
        log: "The team preserves sanity and loses a logo slide.",
      },
    ],
  },
  {
    id: "founder-podcast-goes-viral",
    title: "Founder Podcast Goes Viral",
    category: "pr",
    trigger: [
      { metric: "founderHealth", op: ">=", value: 40 },
      { metric: "reputation", op: ">=", value: 45 },
    ],
    choices: [
      {
        id: "convert-inbound",
        label: "Convert inbound",
        effects: [
          { metric: "mrr", delta: 100_000 },
          { metric: "reputation", delta: 5 },
        ],
        log: "The hot takes become leads before becoming liabilities.",
      },
      {
        id: "lean-into-persona",
        label: "Lean into persona",
        effects: [
          { metric: "marketHeat", delta: 8 },
          { metric: "founderHealth", delta: -4 },
        ],
        log: "The founder becomes the brand, which is flattering and structurally alarming.",
      },
    ],
  },
  {
    id: "dataset-consent-complaint",
    title: "Dataset Consent Complaint",
    category: "regulation",
    trigger: [{ metric: "modelPower", op: ">=", value: 50 }],
    choices: [
      {
        id: "remove-dataset",
        label: "Remove the dataset",
        effects: [
          { metric: "complianceRisk", delta: -9 },
          { metric: "modelPower", delta: -4 },
        ],
        log: "The model gets weaker and the legal inbox gets quieter.",
      },
      {
        id: "argue-fair-use",
        label: "Argue fair use",
        effects: [
          { metric: "modelPower", delta: 2 },
          { metric: "complianceRisk", delta: 8 },
        ],
        log: "The argument is bold, expensive, and forwarded widely.",
      },
    ],
  },
  {
    id: "cloud-credit-expiration",
    title: "Cloud Credits Near Expiration",
    category: "tech",
    trigger: [{ metric: "computeSupply", op: ">=", value: 60 }],
    choices: [
      {
        id: "train-now",
        label: "Train now",
        effects: [
          { metric: "modelPower", delta: 6 },
          { metric: "techDebt", delta: 3 },
        ],
        log: "Credits become checkpoints and a few suspicious scripts.",
      },
      {
        id: "save-team-focus",
        label: "Save team focus",
        effects: [
          { metric: "productQuality", delta: 3 },
          { metric: "computeSupply", delta: -5 },
        ],
        log: "Some free money expires, but the roadmap stops thrashing.",
      },
    ],
  },
  {
    id: "local-government-demo-day",
    title: "Local Government Demo Day",
    category: "customer",
    trigger: [{ metric: "reputation", op: ">=", value: 45 }],
    choices: [
      {
        id: "attend-demo-day",
        label: "Attend demo day",
        effects: [
          { metric: "cash", delta: 500_000 },
          { metric: "complianceRisk", delta: -2 },
        ],
        log: "The grant is real, and so is the reporting template.",
      },
      {
        id: "skip-ceremony",
        label: "Skip ceremony",
        effects: [
          { metric: "productQuality", delta: 2 },
          { metric: "reputation", delta: -2 },
        ],
        log: "The team writes code while competitors pose with plaques.",
      },
    ],
  },
  {
    id: "enterprise-churn-scare",
    title: "Enterprise Churn Scare",
    category: "customer",
    trigger: [
      { metric: "pmf", op: "<=", value: 40 },
      { metric: "arr", op: ">=", value: 500_000 },
    ],
    choices: [
      {
        id: "embed-success-team",
        label: "Embed success team",
        effects: [
          { metric: "pmf", delta: 5 },
          { metric: "grossMargin", delta: -3 },
        ],
        log: "Retention improves through heroic support and thin margins.",
      },
      {
        id: "replace-bad-fit",
        label: "Replace bad-fit customers",
        effects: [
          { metric: "arr", delta: -400_000 },
          { metric: "productQuality", delta: 4 },
        ],
        log: "The revenue dip hurts less than building for the wrong people.",
      },
    ],
  },
  {
    id: "competitor-poaches-sales-lead",
    title: "Competitor Poaches Sales Lead",
    category: "employee",
    trigger: [{ metric: "arr", op: ">=", value: 1_500_000 }],
    choices: [
      {
        id: "counter-offer",
        label: "Counter-offer",
        effects: [
          { metric: "morale", delta: 3 },
          { metric: "cash", delta: -300_000 },
        ],
        log: "The sales lead stays, and compensation philosophy leaves the building.",
      },
      {
        id: "promote-from-within",
        label: "Promote from within",
        effects: [
          { metric: "arr", delta: -300_000 },
          { metric: "morale", delta: 4 },
        ],
        log: "The pipeline wobbles while the team respects the decision.",
      },
    ],
  },
  {
    id: "pricing-page-ridiculed",
    title: "Pricing Page Is Ridiculed",
    category: "pr",
    trigger: [
      { metric: "grossMargin", op: "<=", value: 40 },
      { metric: "arr", op: ">=", value: 500_000 },
    ],
    choices: [
      {
        id: "simplify-pricing",
        label: "Simplify pricing",
        effects: [
          { metric: "pmf", delta: 4 },
          { metric: "grossMargin", delta: -2 },
        ],
        log: "Customers understand the page, which makes finance nervous.",
      },
      {
        id: "defend-complexity",
        label: "Defend complexity",
        effects: [
          { metric: "grossMargin", delta: 3 },
          { metric: "reputation", delta: -3 },
        ],
        log: "The pricing remains optimized for a spreadsheet no buyer opens.",
      },
    ],
  },
  {
    id: "ai-agent-runs-amok",
    title: "AI Agent Runs Amok In Pilot",
    category: "tech",
    trigger: [
      { metric: "productQuality", op: "<=", value: 45 },
      { metric: "arr", op: ">=", value: 500_000 },
    ],
    choices: [
      {
        id: "add-guardrails",
        label: "Add guardrails",
        effects: [
          { metric: "productQuality", delta: 5 },
          { metric: "complianceRisk", delta: -4 },
        ],
        log: "The agent becomes less magical and much less lawsuit-shaped.",
      },
      {
        id: "call-it-beta",
        label: "Call it beta",
        effects: [
          { metric: "marketHeat", delta: 3 },
          { metric: "reputation", delta: -5 },
        ],
        log: "Beta explains everything except the customer's lost weekend.",
      },
    ],
  },
  {
    id: "board-demands-ai-native-margin",
    title: "Board Demands AI-Native Margin",
    category: "funding",
    trigger: [{ metric: "grossMargin", op: "<=", value: 30 }],
    choices: [
      {
        id: "raise-prices",
        label: "Raise prices",
        effects: [
          { metric: "grossMargin", delta: 8 },
          { metric: "pmf", delta: -3 },
        ],
        log: "The unit economics improve and the SMB segment quietly leaves.",
      },
      {
        id: "optimize-stack",
        label: "Optimize the stack",
        effects: [
          { metric: "grossMargin", delta: 5 },
          { metric: "techDebt", delta: -3 },
          { metric: "founderHealth", delta: -3 },
        ],
        log: "The infra team finds savings hidden under three abandoned experiments.",
      },
    ],
  },
  {
    id: "sea-reseller-wants-exclusivity",
    title: "SEA Reseller Wants Exclusivity",
    category: "global",
    trigger: [{ metric: "globalReadiness", op: ">=", value: 40 }],
    choices: [
      {
        id: "grant-exclusivity",
        label: "Grant exclusivity",
        effects: [
          { metric: "arr", delta: 1_000_000 },
          { metric: "globalReadiness", delta: -3 },
        ],
        log: "The region opens through one partner and one new dependency.",
      },
      {
        id: "build-channel",
        label: "Build broader channel",
        effects: [
          { metric: "globalReadiness", delta: 5 },
          { metric: "cash", delta: -400_000 },
        ],
        log: "The company buys optionality with time and travel receipts.",
      },
    ],
  },
  {
    id: "policy-team-wants-red-team",
    title: "Policy Team Wants Red Team",
    category: "regulation",
    trigger: [{ metric: "complianceRisk", op: ">=", value: 45 }],
    choices: [
      {
        id: "run-red-team",
        label: "Run red team",
        effects: [
          { metric: "complianceRisk", delta: -8 },
          { metric: "productQuality", delta: 2 },
        ],
        log: "The findings are awkward and useful, the best kind of awkward.",
      },
      {
        id: "ship-before-review",
        label: "Ship before review",
        effects: [
          { metric: "marketHeat", delta: 4 },
          { metric: "complianceRisk", delta: 6 },
        ],
        log: "Shipping first creates momentum and a future incident doc.",
      },
    ],
  },
  {
    id: "customer-asks-source-code-escrow",
    title: "Customer Asks Source Code Escrow",
    category: "customer",
    trigger: [{ metric: "arr", op: ">=", value: 5_000_000 }],
    choices: [
      {
        id: "agree-escrow",
        label: "Agree to escrow",
        effects: [
          { metric: "arr", delta: 1_000_000 },
          { metric: "complianceRisk", delta: 2 },
        ],
        log: "The enterprise buyer feels safe; the CTO feels watched.",
      },
      {
        id: "offer-sla",
        label: "Offer stronger SLA",
        effects: [
          { metric: "reputation", delta: 3 },
          { metric: "arr", delta: 300_000 },
        ],
        log: "Trust is sold as uptime instead of source code access.",
      },
    ],
  },
  {
    id: "audit-finds-inflated-arr",
    title: "Audit Finds Inflated ARR",
    category: "funding",
    trigger: [
      { metric: "complianceRisk", op: ">=", value: 55 },
      { metric: "arr", op: ">=", value: 5_000_000 },
    ],
    choices: [
      {
        id: "restate-arr",
        label: "Restate ARR immediately",
        effects: [
          { metric: "arr", delta: -1_200_000 },
          { metric: "complianceRisk", delta: -10 },
          { metric: "boardPressure", delta: 4 },
        ],
        log: "The board hates the correction, but diligence gets a cleaner number.",
      },
      {
        id: "contest-audit",
        label: "Contest the audit finding",
        effects: [
          { metric: "marketHeat", delta: 3 },
          { metric: "complianceRisk", delta: 9 },
          { metric: "reputation", delta: -5 },
        ],
        log: "The metric survives the week while trust leaves the room.",
      },
    ],
  },
  {
    id: "paper-replication-crisis",
    title: "Paper Replication Crisis",
    category: "pr",
    trigger: [
      { metric: "reputation", op: ">=", value: 65 },
      { metric: "complianceRisk", op: ">=", value: 45 },
    ],
    choices: [
      {
        id: "publish-reproduction-kit",
        label: "Publish reproduction kit",
        effects: [
          { metric: "reputation", delta: 4 },
          { metric: "modelPower", delta: -3 },
          { metric: "complianceRisk", delta: -6 },
        ],
        log: "The claim gets smaller and more durable.",
      },
      {
        id: "attack-critics",
        label: "Attack the critics",
        effects: [
          { metric: "marketHeat", delta: 6 },
          { metric: "reputation", delta: -8 },
          { metric: "founderHealth", delta: -4 },
        ],
        log: "The thread trends, then turns into a recruiting problem.",
      },
    ],
  },
  {
    id: "overseas-data-residency",
    title: "Overseas Data Residency Demand",
    category: "global",
    trigger: [
      { metric: "globalReadiness", op: ">=", value: 45 },
      { metric: "arr", op: ">=", value: 3_000_000 },
    ],
    choices: [
      {
        id: "stand-up-region",
        label: "Stand up regional storage",
        effects: [
          { metric: "globalReadiness", delta: 6 },
          { metric: "complianceRisk", delta: -5 },
          { metric: "cash", delta: -900_000 },
        ],
        log: "The region becomes real after procurement meets infrastructure.",
      },
      {
        id: "centralize-data",
        label: "Centralize for now",
        effects: [
          { metric: "grossMargin", delta: 3 },
          { metric: "arr", delta: -700_000 },
          { metric: "complianceRisk", delta: 5 },
        ],
        log: "Architecture stays simple and the overseas pipeline gets narrower.",
      },
    ],
  },
  {
    id: "star-researcher-poached",
    title: "Star Researcher Is Poached",
    category: "employee",
    trigger: [
      { metric: "modelPower", op: ">=", value: 55 },
      { metric: "marketHeat", op: ">=", value: 65 },
    ],
    choices: [
      {
        id: "make-retention-grant",
        label: "Make retention grant",
        effects: [
          { metric: "modelPower", delta: 3 },
          { metric: "morale", delta: 4 },
          { metric: "founderEquity", delta: -2 },
        ],
        log: "The researcher stays after the cap table makes room.",
      },
      {
        id: "document-the-stack",
        label: "Document the stack",
        effects: [
          { metric: "modelPower", delta: -6 },
          { metric: "techDebt", delta: -4 },
          { metric: "cash", delta: 300_000 },
        ],
        log: "The departure hurts less after knowledge leaves their laptop.",
      },
    ],
  },
  {
    id: "gpu-supply-squeeze",
    title: "GPU Supply Squeeze",
    category: "tech",
    trigger: [{ metric: "computeCost", op: ">=", value: 40 }],
    choices: [
      {
        id: "lock-annual-capacity",
        label: "Lock annual capacity",
        effects: [
          { metric: "computeSupply", delta: 10 },
          { metric: "cash", delta: -1_500_000 },
          { metric: "computeCost", delta: 4 },
        ],
        log: "The cluster is available, and the balance sheet notices.",
      },
      {
        id: "distill-models",
        label: "Distill smaller models",
        effects: [
          { metric: "computeCost", delta: -8 },
          { metric: "productQuality", delta: -2 },
          { metric: "modelPower", delta: -3 },
        ],
        log: "Inference gets cheaper after the model gives up some swagger.",
      },
    ],
  },
  {
    id: "enterprise-security-review",
    title: "Enterprise Security Review",
    category: "customer",
    trigger: [
      { metric: "arr", op: ">=", value: 2_000_000 },
      { metric: "complianceRisk", op: ">=", value: 30 },
    ],
    choices: [
      {
        id: "fund-security-sprint",
        label: "Fund security sprint",
        effects: [
          { metric: "complianceRisk", delta: -7 },
          { metric: "arr", delta: 800_000 },
          { metric: "runway", delta: -1 },
        ],
        log: "The checklist becomes shippable work and a signed expansion.",
      },
      {
        id: "answer-with-roadmap",
        label: "Answer with roadmap",
        effects: [
          { metric: "boardPressure", delta: 4 },
          { metric: "arr", delta: -400_000 },
          { metric: "productQuality", delta: 2 },
        ],
        log: "The buyer wants controls, not promises in a deck.",
      },
    ],
  },
  {
    id: "founder-burnout-rumor",
    title: "Founder Burnout Rumor",
    category: "health",
    trigger: [{ metric: "founderHealth", op: "<=", value: 35 }],
    choices: [
      {
        id: "take-visible-break",
        label: "Take visible break",
        effects: [
          { metric: "founderHealth", delta: 12 },
          { metric: "boardPressure", delta: 3 },
          { metric: "morale", delta: 2 },
        ],
        log: "The team sees recovery as operating discipline, even if the board flinches.",
      },
      {
        id: "deny-and-keep-pitching",
        label: "Deny and keep pitching",
        effects: [
          { metric: "marketHeat", delta: 4 },
          { metric: "founderHealth", delta: -7 },
          { metric: "reputation", delta: -2 },
        ],
        log: "The calendar stays full while everyone learns to read eye bags.",
      },
    ],
  },
  {
    id: "giant-launches-free-agent",
    title: "Giant Launches Free Agent",
    category: "giant",
    trigger: [
      { metric: "pmf", op: "<=", value: 45 },
      { metric: "marketHeat", op: ">=", value: 60 },
    ],
    choices: [
      {
        id: "narrow-to-power-users",
        label: "Narrow to power users",
        effects: [
          { metric: "pmf", delta: 6 },
          { metric: "marketHeat", delta: -5 },
          { metric: "productQuality", delta: 3 },
        ],
        log: "The product gets less famous and more useful.",
      },
      {
        id: "match-free-tier",
        label: "Match the free tier",
        effects: [
          { metric: "marketHeat", delta: 5 },
          { metric: "grossMargin", delta: -8 },
          { metric: "boardPressure", delta: 5 },
        ],
        log: "Growth survives by sending the margin model into triage.",
      },
    ],
  },
] satisfies GameEvent[];
