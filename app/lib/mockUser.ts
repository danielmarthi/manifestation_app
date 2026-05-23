// Sample profile used to render the visual MVP.
// In a functional MVP this would be hydrated from the onboarding output + persistence.

export type BeliefType = "inherited" | "self-created" | "fear-based" | "identity-based";

export interface Belief {
  id: string;
  text: string;
  type: BeliefType;
  dissolved: boolean;
}

export interface EvidenceEntry {
  id: string;
  date: string;
  kind: "win" | "synchronicity" | "receiving" | "resistance";
  text: string;
}

export const mockUser = {
  firstName: "Eliza",
  desireArea: "Financial security",
  desireStatement:
    "Financial security that means I never panic about a bill again.",
  primaryBlock: "It hasn't worked before — so why would it now?",
  blockType: "past evidence",
  assumption: "It is already done. Money flows to me with ease.",
  gapStatement:
    "Right now I believe abundance is for other people. I want to believe it is the natural state of who I am.",
  currentPhase: 4,
  currentPhaseName: "The Practice Stack",
  currentPhaseStep: "Day 14 — Morning Ritual",
  streak: 14,
  identityStatements: [
    "I am the kind of person money is drawn to.",
    "I receive easily.",
    "I trust the timing of my life.",
    "I make decisions from abundance, not fear.",
    "My nervous system is safe with money.",
  ],
  futureSelf: {
    name: "Eliza, Future",
    portrait: "/avatars/future.svg",
    body: [
      "She moves through financial decisions with ease.",
      "She expects good things — and is consistently right.",
      "Money flows to her because she has finally stopped blocking it.",
      "She rests deeply. She gives generously. She receives without flinching.",
      "She takes the unhurried action that pulls, not the strained one that pushes.",
    ],
    traits: ["unhurried", "generous", "expectant", "rooted", "open"],
  },
  oldSelf: {
    name: "Eliza, Before",
    portrait: "/avatars/old.svg",
    body: [
      "She worked hard but secretly believed abundance was for other people.",
      "She checked her bank account with a knot in her stomach.",
      "She was capable and exhausted at the same time.",
      "She tried, she gave up, she tried again — quietly carrying the story that nothing she manifests ever actually lands.",
    ],
  },
  beliefs: [
    { id: "b1", text: "Money is for other people, not me.", type: "inherited", dissolved: true },
    { id: "b2", text: "If I want it too much, it won't come.", type: "fear-based", dissolved: true },
    { id: "b3", text: "I have to work brutally hard to deserve abundance.", type: "identity-based", dissolved: false },
    { id: "b4", text: "It's never worked before, so it won't work now.", type: "self-created", dissolved: false },
    { id: "b5", text: "Receiving means I owe someone.", type: "inherited", dissolved: false },
  ] satisfies Belief[],
  todayPractice: [
    { id: "breathe", label: "Breathe — three breaths, body scan", done: true },
    { id: "be", label: "Be — read today's identity statement aloud", done: true },
    { id: "see", label: "See — today's visualization (90s)", done: false },
    { id: "thank", label: "Thank — one gratitude in advance", done: false },
    { id: "assume", label: "Assume — read & feel the assumption", done: false },
  ],
  recentEvidence: [
    {
      id: "e1",
      date: "Yesterday",
      kind: "synchronicity",
      text: "Unexpected refund from an old subscription — $84. Third small unexpected return this week.",
    },
    {
      id: "e2",
      date: "2 days ago",
      kind: "win",
      text: "Said no to a contract that drained me. Felt expansion, not fear.",
    },
    {
      id: "e3",
      date: "3 days ago",
      kind: "receiving",
      text: "A friend insisted on paying for dinner. I let her — without the usual apology spiral.",
    },
  ] satisfies EvidenceEntry[],
};

export type MockUser = typeof mockUser;
