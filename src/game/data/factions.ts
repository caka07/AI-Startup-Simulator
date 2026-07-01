import type { Faction } from "../types";

export const factions = [
  {
    id: "deepduck",
    name: "DeepDuck",
    description: "A ruthless open-source lab that releases cheaper models five minutes before your launch.",
    role: "Open-source rival",
    pressure: "Commoditizes model power and mocks closed demos.",
  },
  {
    id: "openmind",
    name: "OpenMind",
    description: "The global model brand every board deck compares you against in twelve-point gray text.",
    role: "Global frontier lab",
    pressure: "Raises customer expectations and investor moat questions.",
  },
  {
    id: "moralmachine",
    name: "MoralMachine",
    description: "A safety watchdog that can turn one spicy demo into a month of compliance workshops.",
    role: "AI governance lobby",
    pressure: "Increases scrutiny when reputation outruns controls.",
  },
  {
    id: "green-furnace",
    name: "Green Furnace",
    description: "The GPU cloud vendor whose waitlist is longer than your runway.",
    role: "Compute supplier",
    pressure: "Trades scarce compute for cash, PR, or painful lock-in.",
  },
  {
    id: "cloudsoft",
    name: "CloudSoft",
    description: "An enterprise platform giant that says partner while copying the roadmap.",
    role: "Cloud distribution gatekeeper",
    pressure: "Pushes pluginization and revenue share.",
  },
  {
    id: "byteplanet",
    name: "BytePlanet",
    description: "A traffic empire that can send users by the million and keep all the data exhaust.",
    role: "Consumer traffic giant",
    pressure: "Offers growth spikes with strategic dependency.",
  },
  {
    id: "tencentacle",
    name: "Tencentacle",
    description: "A super-app octopus with channels, games, payments, and a memory for every refusal.",
    role: "Ecosystem incumbent",
    pressure: "Bundles distribution with partnership strings.",
  },
  {
    id: "alicloud-temple",
    name: "Alicloud Temple",
    description: "A cloud cathedral where every blessing arrives as credits and migration work.",
    role: "Infrastructure incumbent",
    pressure: "Turns cloud credits into architecture gravity.",
  },
] satisfies Faction[];
