import type { EmployeeRole } from "../types";

export const employeeRoles = [
  {
    id: "researcher",
    name: "Researcher",
    description: "Pushes model quality while quietly attracting recruiter DMs from everyone richer.",
    salaryBase: 900_000,
    strengths: [
      { metric: "modelPower", delta: 6 },
      { metric: "reputation", delta: 2 },
    ],
    risks: ["flight risk", "paper-first instincts"],
  },
  {
    id: "engineer",
    name: "Engineer",
    description: "Turns notebooks into services and services into pager rotations.",
    salaryBase: 650_000,
    strengths: [
      { metric: "productQuality", delta: 5 },
      { metric: "techDebt", delta: -3 },
    ],
    risks: ["burnout", "platform sprawl"],
  },
  {
    id: "product-manager",
    name: "Product Manager",
    description: "Translates founder prophecy into tickets customers may recognize.",
    salaryBase: 520_000,
    strengths: [
      { metric: "pmf", delta: 5 },
      { metric: "productQuality", delta: 2 },
    ],
    risks: ["roadmap theater", "meeting inflation"],
  },
  {
    id: "sales",
    name: "Sales",
    description: "Finds budget owners and occasionally sells features engineering has only dreamed about.",
    salaryBase: 480_000,
    strengths: [
      { metric: "mrr", delta: 3 },
      { metric: "arr", delta: 300_000 },
    ],
    risks: ["overpromising", "discount addiction"],
  },
  {
    id: "compliance",
    name: "Compliance",
    description: "Adds process before regulators add headlines.",
    salaryBase: 500_000,
    strengths: [
      { metric: "complianceRisk", delta: -6 },
      { metric: "globalReadiness", delta: 3 },
    ],
    risks: ["slower launches", "policy pileup"],
  },
  {
    id: "finance",
    name: "Finance",
    description: "Explains why booked revenue and cash in bank are spiritually different.",
    salaryBase: 450_000,
    strengths: [
      { metric: "runway", delta: 1 },
      { metric: "grossMargin", delta: 3 },
    ],
    risks: ["spreadsheet vetoes", "morale drag"],
  },
  {
    id: "cfo",
    name: "CFO",
    description: "Turns chaos into board packets and invoices that survive diligence.",
    salaryBase: 1_200_000,
    strengths: [
      { metric: "boardPressure", delta: -6 },
      { metric: "valuation", delta: 2_000_000 },
    ],
    risks: ["professional CEO whispers", "process tax"],
  },
  {
    id: "overseas-bd",
    name: "Overseas BD",
    description: "Lives on planes, localizes demos, and discovers every country's procurement trap.",
    salaryBase: 700_000,
    strengths: [
      { metric: "globalReadiness", delta: 6 },
      { metric: "arr", delta: 500_000 },
    ],
    risks: ["travel burn", "compliance exposure"],
  },
] satisfies EmployeeRole[];
