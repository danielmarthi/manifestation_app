// All 21 phase exercises — definitions, content, pre-fill types, AI instructions.
// Template variables: {desire_area}, {future_self_name}, {old_self_name}, {assumption}
// are replaced at render time from the user's profile.

export type PrefillType =
  | "desire"                 // desire_statement + desire_area from profile
  | "story"                  // about_text + primary-area onboarding_answers answer
  | "beliefs-all"            // all beliefs from beliefs table
  | "beliefs-inherited"      // beliefs tagged 'inherited'
  | "beliefs-identity"       // beliefs tagged 'identity-based'
  | "gap-statement"          // gap_statement from profile
  | "old-self-portrait"      // old_self_portrait + old_self_tags
  | "old-self-name-header"   // just old_self_name as sender context
  | "future-self-portrait"   // future_self_portrait + future_self_tags
  | "assumption"             // assumption from profile
  | "ritual-data"            // last 7 days of practice_log completion
  | "future-self-name-sender"; // future_self_name as the letter sender

export interface ExerciseDef {
  slug: string;
  phase: number;
  orderInPhase: number;
  title: string;
  subtitle: string;
  isCore: boolean;
  context: string;       // shown to user before the exercise
  instruction: string;   // brief how-to line
  prompt: string;        // the actual question/prompt shown in textarea label area
  cta: string;           // submit button text
  prefillType: PrefillType | null;
  prefillLabel: string | null;  // label shown above the pre-fill block
  aiInstruction: string; // injected into AI system prompt for the response
}

// ============================================================================
// PHASE 1 — THE AWAKENING
// ============================================================================

const phase1: ExerciseDef[] = [
  {
    slug: "p1-desire-verification",
    phase: 1,
    orderInPhase: 1,
    title: "Verify the desire",
    subtitle: "Is this desire actually yours?",
    isCore: true,
    context: `Reality Transurfing introduces one of the most important questions in this entire program: is the goal you're pursuing genuinely yours, or has it been shaped by what you think you should want — by comparison, by what would impress people, by filling an emotional gap?

A desire that is truly yours produces a specific felt sense when you imagine having it: expansion, rightness, a deep exhale. A pendulum goal — one adopted from external pressure — produces a different feeling: relief at approval, or excitement mixed with anxiety.

Learning to tell the difference is essential. You cannot build a new identity around a desire that isn't genuinely yours and have it feel like freedom.`,
    instruction: "Read what you shared about your desire. Then sit quietly and feel — not analyse. Trust the first honest answer.",
    prompt: `When you imagine having {desire_area} fully — not the achievement of it, but the quiet ordinary day six months after it arrived — what do you feel? Expansion and rightness, or relief and performance? Is this desire something you'd want if no one would ever know you had it? Write honestly. If the answer surprises you, follow it.`,
    cta: "Submit →",
    prefillType: "desire",
    prefillLabel: "From your intake — what you said you want:",
    aiInstruction: `This is the most important exercise in Phase 1. Read their response carefully. If they discover the desire is genuinely theirs: affirm the felt sense they described and note what that tells you about the depth of their motivation. If they discover complexity — that the desire is partly theirs and partly pendulum — name this clearly and help them find the genuine desire underneath. This is not a problem — it is a clarification. Ask: underneath {desire_area}, what are you actually reaching for? Name the feeling, not the goal.`,
  },
  {
    slug: "p1-full-story",
    phase: 1,
    orderInPhase: 2,
    title: "The story you've been living",
    subtitle: "Go deeper than the intake",
    isCore: true,
    context: `You've already told me some of your story. What you wrote in your intake was the beginning — written quickly, in the context of starting something new. Now, with a few days of practice behind you and the question asked more directly, there is usually more.

The details you glossed over. The part that felt too specific or too vulnerable to include. The thread that, when you pull it, explains more than the rest of the story combined.

What you can see clearly, you can work with. What you avoid seeing continues to run you from below.`,
    instruction: "Read what you already shared. Then write what you haven't said yet — the part that feels more exposed.",
    prompt: `You've started the story. Now go deeper. What's the part you didn't include — the specific moment, the specific person, the specific conclusion you drew that has been running quietly ever since? Write the version you'd tell someone who you knew could handle it.`,
    cta: "Submit →",
    prefillType: "story",
    prefillLabel: "From your intake — what you've already shared about your relationship with {desire_area}:",
    aiInstruction: `You have access to their full onboarding story. Read what they added in this exercise against what they shared before. Name specifically what's new — what they went deeper on. Ask about the most specific thing they mentioned: the detail that feels most charged. Dispenza: the body has been living this story — where do they feel it?`,
  },
  {
    slug: "p1-belief-map",
    phase: 1,
    orderInPhase: 3,
    title: "What you actually believe",
    subtitle: "Refine your belief map",
    isCore: true,
    context: `These beliefs were identified from your intake answers. They are real — you can see them in what you wrote. But the intake was a first pass. Now you have been sitting with this material for a few days. Beliefs that were vague are becoming more specific. Patterns that were felt are becoming nameable.

The map below is a starting point. Your job today is to make it more precise. Not softer — more precise. The belief that stings slightly when you read it is the one closest to the truth.`,
    instruction: "Look at each belief already identified. Is the wording precise — or does it need sharpening? Are there beliefs missing? Add, refine, and for any new beliefs: tag the type and trace the origin.",
    prompt: `Look at your belief map. What needs to be more precise? What's missing? For any beliefs you're adding: state them exactly as they actually run (not softened), tag the type, and name where they came from. For existing beliefs: refine the wording until it's uncomfortably accurate.`,
    cta: "Submit →",
    prefillType: "beliefs-all",
    prefillLabel: "From your intake — the beliefs I identified from what you shared:",
    aiInstruction: `Compare what they've added or refined to the original beliefs from onboarding. Note which beliefs they've made more precise — this shows deepening self-awareness. If they've softened any beliefs (made them less specific or less charged), name this gently: "I notice the original wording was X and you've refined it to Y — which feels more accurate to how the belief actually runs in you?"`,
  },
  {
    slug: "p1-gap-statement",
    phase: 1,
    orderInPhase: 4,
    title: "Your honest bridge",
    subtitle: "Refine the gap statement",
    isCore: true,
    context: `A gap statement has two sides: the honest now, and the genuine direction. When it works, the first half should feel like exhaling into truth, and the second half should feel like a direction you can actually sense rather than just describe.

After a week of honest seeing, both sides often become more precise. The first half more honest. The second half more felt.

Test each half: is the current belief stated exactly as it runs — or is it softened? Is the direction genuinely felt — or still somewhat aspirational?`,
    instruction: "Read your gap statement. Test each half. Rewrite until both halves are as precise and real as you can make them.",
    prompt: `Read your gap statement. Is the first half uncomfortably honest — or have you softened it slightly? Is the second half a felt direction or a hoped-for one? Rewrite it until both halves are as precise and real as you can make them.`,
    cta: "Submit →",
    prefillType: "gap-statement",
    prefillLabel: "From your intake — the gap statement we built together:",
    aiInstruction: `Evaluate the refined gap statement on two dimensions: honesty of the current belief (not softened, not dramatised — accurate) and felt quality of the direction (not aspirational "I hope to believe" but directional "I am becoming someone who"). The best gap statements have a slight ache in the first half and a genuine pull in the second.`,
  },
  {
    slug: "p1-origins",
    phase: 1,
    orderInPhase: 5,
    title: "Who wrote these rules",
    subtitle: "Trace the inherited beliefs",
    isCore: true,
    context: `Inherited beliefs are conclusions drawn from someone else's experience and installed as if universal. They were often absorbed before you were old enough to question them — from watching, from being told, from the silence around certain subjects.

The person who held these beliefs was not wrong about their own experience. They were simply wrong about whether their experience was your destiny.

You did not choose to inherit these beliefs. But you can choose — now, with full awareness — what to do with them.`,
    instruction: "For each inherited belief shown — trace it specifically. Not just 'from my parents' but: who exactly, what specifically they said or modelled, what you concluded, and whether that conclusion is evidence about your potential or only about theirs.",
    prompt: `For each inherited belief: who specifically held it? How did you absorb it — was it spoken, modelled, or implied? What did you conclude from watching them? And: is that conclusion evidence about your potential, or only about what was possible for them, in their circumstances, with their beliefs?`,
    cta: "Submit →",
    prefillType: "beliefs-inherited",
    prefillLabel: "Your inherited beliefs — the ones that came from someone else:",
    aiInstruction: `Help them see the crucial distinction: someone else's conclusion about their own life is not a fact about yours. Be specific — pull their actual named beliefs and ask: given what you now know about identity and life lines (Transurfing), what life line was that person on? Is that the same life line you're choosing?`,
  },
];

// ============================================================================
// PHASE 2 — THE CLEARING
// ============================================================================

const phase2: ExerciseDef[] = [
  {
    slug: "p2-somatic",
    phase: 2,
    orderInPhase: 1,
    title: "Where do you carry this?",
    subtitle: "The body check-in",
    isCore: true,
    context: `Beliefs are not only mental. They exist as physical patterns — tension in specific places, held breath, the familiar contraction that happens automatically in certain situations.

Dispenza's research confirms this: the body has been running the emotional programme so long it has become the default state. Before clearing work, you locate where the beliefs live physically. This becomes your reference point — so you can track when something has genuinely shifted, not just been intellectually understood.

You cannot dissolve a belief you haven't felt. This exercise finds where to look.`,
    instruction: "Sit quietly. Three slow breaths. Bring your primary belief about {desire_area} to mind — not as a thought but as a felt sense. Where in your body do you feel it?",
    prompt: `Bring your most central belief about {desire_area} to mind as a feeling rather than a thought. Scan your body slowly. Where do you feel it — chest, stomach, throat, shoulders? Describe the physical sensation precisely: is it tight, heavy, hollow, contracted? What image or memory comes with it? This is your baseline. We will return to it.`,
    cta: "Submit →",
    prefillType: null,
    prefillLabel: null,
    aiInstruction: `Respond to their somatic description with specificity. Name what the physical pattern suggests about how long this has been running in their body. Dispenza framing: the body has memorised this emotional state — it fires automatically before the thought. Ask: when in your daily life does this physical sensation appear without you choosing it? That moment is the programme running.`,
  },
  {
    slug: "p2-importance",
    phase: 2,
    orderInPhase: 2,
    title: "Put down the grip",
    subtitle: "Reducing excess importance",
    isCore: true,
    context: `This is Reality Transurfing's most important practical teaching, and it comes before the belief work because it affects everything else.

Excess importance is the energy of desperately wanting something — the obsessive thinking about it, the constant checking, the fear of not having it. This energy is not commitment. It is not focus. It is a signal of lack broadcast continuously — and it creates forces that work to correct the imbalance by pushing the desire further away.

You can want something deeply and hold it lightly. That combination — clear desire without grasping — is one of the most powerful states in this work.`,
    instruction: "Honest inventory of how much importance you have attached to this desire. Not whether it matters — it does. But are you able to be okay without it, today?",
    prompt: `How do you currently hold your desire for {desire_area}? Do you find yourself mentally checking for signs it's coming? Does thinking about it bring ease or anxiety? Can you imagine being genuinely okay — not resigned, not giving up — but genuinely at peace while it's still becoming? Write honestly about the grip you have on this desire, and what it feels like in your body when you think about whether it's coming.`,
    cta: "Submit →",
    prefillType: "desire",
    prefillLabel: "What you're working toward:",
    aiInstruction: `Apply Transurfing's excess importance concept specifically. The question is not whether they want this — of course they do. The question is whether the wanting has become a constant signal of its absence. If they describe anxiety, checking, or an inability to feel okay without it: name this as excess importance clearly and explain the mechanism — this energy does not attract, it repels. Ask: what would it feel like to want this as naturally as you want good weather tomorrow — genuinely preferred but not gripped?`,
  },
  {
    slug: "p2-forgiveness",
    phase: 2,
    orderInPhase: 3,
    title: "Write to the version of you who tried",
    subtitle: "The forgiveness script",
    isCore: true,
    context: `One of the most consistent patterns in people who cannot shift: unresolved self-blame. The quiet belief that they should have figured this out sooner, done better, not made the decisions they made.

This creates a subconscious punishment loop — a feeling that they don't deserve what they want because they failed before. The exit is genuine forgiveness. Not performed forgiveness. The real recognition that the version of you who tried before was doing exactly what they could with what they believed at the time.

That is true. And it is enough to release the charge.`,
    instruction: "Write to the version of yourself shown in your old self portrait — not harshly, not with pity. With genuine understanding. Tell them specifically what you now understand about why they did what they did.",
    prompt: `Write to {old_self_name} — the version of you described in your portrait above. Tell them what you now understand about why they believed what they believed and did what they did. Name specific moments from your story. Tell them you understand. Tell them it's enough. Forgive them precisely — not generally. Write until it actually lands, not until it sounds complete.`,
    cta: "Submit →",
    prefillType: "old-self-portrait",
    prefillLabel: "From your intake — your old self portrait:",
    aiInstruction: `You have their old self portrait and tags. Reference specific elements from both — name a specific pattern from the portrait and ask: have you written directly to that part of them? Look for genuine emotional movement versus performed completion. If the letter is short, intellectual, or reads like an affirmation: name it directly. Ask them to go to one specific moment from their Phase 1 story and write to the version of them that was there.`,
  },
  {
    slug: "p2-dissolution-primary",
    phase: 2,
    orderInPhase: 4,
    title: "Dissolve your most central belief",
    subtitle: "Belief dissolution — primary",
    isCore: true,
    context: `A belief is a thought thought so many times it stopped feeling like a thought. It has become automatic — it fires before you've chosen it, shapes what you notice, filters what you allow in.

Dissolving it requires four things: naming it precisely, feeling where it came from emotionally (not just intellectually tracing it), calculating its real cost, and examining whether it is actually true — forensically, not optimistically.

Do not rush the second step — feeling the origin is different from knowing it. The feeling is what dissolves the charge.`,
    instruction: "Run your primary belief through all four steps below. Write in sequence. Do not skip the second one.",
    prompt: `Take your primary belief as shown above.

1. Is this wording exactly right — or does it need to be more precise to be uncomfortably accurate?

2. When did you first feel this — not think it, feel it? What was happening? How old were you?

3. What has believing this cost you specifically — decisions not made, risks not taken, things not pursued?

4. Is it actually true — or is it a conclusion drawn from a limited dataset at a specific time? What would someone who had never believed this do in your exact circumstances?`,
    cta: "Submit →",
    prefillType: "beliefs-all",
    prefillLabel: "Your primary belief about {desire_area}:",
    aiInstruction: `Push hardest on step 4. Most people answer this intellectually. Help them find one concrete counter-example from their own life — a moment when the belief didn't hold, or a person in similar circumstances who got a different result. Even a small crack in the belief's claim to be truth is the beginning of its dissolution. Dispenza: once the belief is seen clearly as a programme rather than reality, its authority begins to dissolve.`,
  },
  {
    slug: "p2-dissolution-identity",
    phase: 2,
    orderInPhase: 5,
    title: "The belief that feels most like you",
    subtitle: "Belief dissolution — identity level",
    isCore: true,
    context: `The hardest beliefs to shift are the ones that feel like personality. "I'm just not someone who..." These have been rehearsed longest and feel most like truth. They are not truth. They are a habit of self-concept.

Dispenza's most important teaching: your personality is a set of memorised thoughts, feelings, and behaviours. It is not fixed. It is a practice. And any practice, changed consistently, produces a different result.

The identity-level belief is the most defended — and its dissolution is the most liberating.`,
    instruction: "Take the identity belief that feels most personally true — the one where releasing it would feel most like losing yourself. That one.",
    prompt: `Which of your identity-level beliefs feels most like you — the one where releasing it would feel most like loss? What would it mean to no longer be the person who holds this belief? What would become available? What would you have to face that this belief currently protects you from? If this is simply a practice — a habit of self-concept — what would the opposite practice produce?`,
    cta: "Submit →",
    prefillType: "beliefs-identity",
    prefillLabel: "Your identity-level beliefs — the ones that feel most like personality:",
    aiInstruction: `The identity belief is defended because it has become part of how they organise their sense of self. Releasing it feels like a small death — acknowledge this directly. Then apply Dispenza: this is not who they are, it is who they have practised being. The neural pathway for this belief is deep and well-worn. A new pathway can be built with consistent different practice. What would the first different practice be?`,
  },
  {
    slug: "p2-completion-letter",
    phase: 2,
    orderInPhase: 6,
    title: "Goodbye — with compassion",
    subtitle: "The completion letter",
    isCore: true,
    context: `In Transurfing, moving from one life line to another requires genuine completion of the old one — not rejection, not contempt, but completion. The old self was not a failure. It was a person working with what they had, believing what they believed.

Dismissing it creates a split that drains energy. Completing it creates freedom.

This letter is the formal close of Phase 2 — the psychological act of moving forward while honoring what was. Write it until the goodbye is genuine. You will know the difference.`,
    instruction: "Write to {old_self_name}. Tell them what you understand. Thank them specifically. And tell them — simply and without drama — that you are moving forward.",
    prompt: `Write to {old_self_name}. You've spent this phase looking at who they were and why. Tell them what you understand now. Thank them specifically — not generally — for what they managed. Then: tell them clearly you are moving forward from here, and that you no longer need them to run things. Write until the goodbye is genuine, not performed.`,
    cta: "Submit →",
    prefillType: "old-self-name-header",
    prefillLabel: "You are writing to:",
    aiInstruction: `This is the closing of Phase 2. The coach response should acknowledge the specific journey of this phase — pull from what they wrote in the forgiveness script and belief dissolution exercises if possible. Name what has genuinely shifted in their relationship with the old self across this phase. Then: send them forward. The tone is a warm but clear completion — not dramatic, not sentimental. A real goodbye.`,
  },
];

// ============================================================================
// PHASE 3 — THE IDENTITY BLUEPRINT
// ============================================================================

const phase3: ExerciseDef[] = [
  {
    slug: "p3-future-inner",
    phase: 3,
    orderInPhase: 1,
    title: "Who you are in the life where it's done",
    subtitle: "Future self — inner life",
    isCore: true,
    context: `Your future self portrait was built quickly in your intake — a first sketch from what you shared. After Phase 1's honest seeing and Phase 2's clearing, the picture usually sharpens. The beliefs that were cleared create space for a more specific identity to emerge.

The future self you can see most clearly is the one most inhabitable. Not aspirational — directional. Not what they'll have, but how they move through the world.

After the Phase work, what's now more specific? What qualities have become clearer?`,
    instruction: "Read your portrait and tags. What's now more precise? What did the intake miss? Deepen the portrait — not by adding things they'll have, but by making the inner life more specific.",
    prompt: `Read your future self portrait above. After Phase 1 and Phase 2 — what's more specific now? What beliefs does your future self hold about {desire_area} that you can describe more precisely now? What do they take for granted that you couldn't articulate before? What have you cleared that makes space for qualities that weren't visible in the intake? Deepen the portrait. Make them more real.`,
    cta: "Submit →",
    prefillType: "future-self-portrait",
    prefillLabel: "From your intake — your future self portrait:",
    aiInstruction: `Compare what they add to the original portrait from onboarding. Name specifically what has deepened — what the Phase work has revealed about their future self that wasn't visible at the start. The future self should feel more inhabitable after Phase 3 than they did in the intake — more specific, more granular, less aspirational and more directional.`,
  },
  {
    slug: "p3-future-granular",
    phase: 3,
    orderInPhase: 2,
    title: "The ordinary Tuesday",
    subtitle: "Future self in specific moments",
    isCore: true,
    context: `Identity is not confirmed in peak moments. It lives in ordinary ones — how you handle a routine setback, what you order at a restaurant, how you answer when someone asks how things are going.

Vague future selves remain fantasy. Specific, behavioural future selves become inhabitable — because you can practise specific behaviours in ordinary moments, whereas you cannot practise being 'successful' or 'confident'.

Build your future self in six ordinary scenes. Not the day they close a deal — a normal Tuesday.`,
    instruction: "Describe your future self in six specific ordinary moments. Use the format: 'When [situation that currently triggers your old pattern], I [what the future self does/thinks/feels — specific].'",
    prompt: `Describe your future self in six specific ordinary moments — not peak ones. Format: "When [ordinary situation that currently triggers your old pattern], I [what the future self does/thinks/feels — specific]." Make it a Tuesday. Make it granular enough that you could actually do one of these things tomorrow.`,
    cta: "Submit →",
    prefillType: null,
    prefillLabel: null,
    aiInstruction: `For each scene they write, evaluate: is this a behaviour description (surface) or an identity description (deep)? "Spends freely" is behaviour. "Makes financial decisions from a baseline of knowing there's enough" is identity. Push toward identity. Ask about the scene that felt most real to write — that one is the thread closest to the surface.`,
  },
  {
    slug: "p3-identity-statements",
    phase: 3,
    orderInPhase: 3,
    title: "The statements that feel like settling in",
    subtitle: "Identity statements refinement",
    isCore: true,
    context: `Identity statements fail when they are aspirational rather than directional. "I am wealthy" said by someone who believes they are not creates dissonance — the gap is too large for the statement to land.

A true identity statement describes how the future self operates, not what they have. When you say it, it should feel like settling into a direction that is already underway — not reaching for a future that hasn't arrived.

The test: say it aloud. Expansion or performance?`,
    instruction: "Review your existing statements. Test each one aloud. Refine the ones that still feel like a reach. Add new ones that Phase work has surfaced. Remove any that feel hollow even after refinement.",
    prompt: `Review your identity statements. Say each one aloud. For each: does it feel like expansion (settling into a true direction) or performance (reaching for something not yet real)? Refine performance statements until they feel like expansion. Add 1-3 new statements that Phase 1 and 2 work has made possible. Remove any that still feel hollow after refinement.`,
    cta: "Submit →",
    prefillType: "future-self-portrait",
    prefillLabel: "From your intake — your current identity statements:",
    aiInstruction: `Evaluate each statement they've submitted on: first-person present tense, identity-level (not outcome-level), and the expansion/performance distinction. Statements that describe how the future self operates ("I make decisions from calm, not fear") will land differently than statements that describe what they'll have. Help them find the precise wording where the statement feels like a recognition rather than a wish.`,
  },
  {
    slug: "p3-assumption-lock",
    phase: 3,
    orderInPhase: 4,
    title: "The sentence you live from",
    subtitle: "Assumption lock refinement",
    isCore: true,
    context: `Your assumption is the sentence your inner life runs from. It is more powerful than any technique — because every technique is only as effective as the assumption underneath it.

A visualisation done while the underlying assumption is "I don't have this yet" reinforces the lack. The same visualisation done from the assumption "I am already this person" reinforces the identity.

The assumption is not a positive thought. It is a settled inner truth — present tense, first person, real enough to exhale into.`,
    instruction: "Read your current assumption. After the Phase work — does it feel more real or less? Has the clearing created space for a more settled version?",
    prompt: `Read your assumption. Say it aloud. Does it feel like exhaling into something already true — or does it still feel like reaching toward something not yet real? If it still feels like a reach, what assumption would feel like an exhale right now? What is so settled in you after Phase 2 that you could state it as present fact? That is your assumption. Refine it.`,
    cta: "Submit →",
    prefillType: "assumption",
    prefillLabel: "From your intake — your current assumption:",
    aiInstruction: `The assumption refined after Phase 2 should feel more settled than the intake version — because beliefs have been cleared that were previously contradicting it. If their refined assumption is essentially the same as the intake version: ask whether the belief dissolution work landed, or whether it was completed intellectually without the felt shift. The assumption should feel easier to inhabit after clearing.`,
  },
  {
    slug: "p3-future-dialogue",
    phase: 3,
    orderInPhase: 5,
    title: "A letter from the version of you who made it",
    subtitle: "Future self dialogue",
    isCore: true,
    context: `This exercise is Neville Goddard's "living in the end" made concrete. You are not writing to your future self — you are writing as your future self.

The version of you who has what you want, looking back at this moment in the program with the clarity of someone who knows how it went. This is not imagination practice. It is identity practice — the deliberate occupation of a perspective that belongs to someone whose reality includes what you want.

The more specifically you can inhabit that perspective, the more real the identity becomes.`,
    instruction: "Write a letter from {future_self_name} to the version of you completing this exercise today. Write as if you are that person — looking back, knowing what happened.",
    prompt: `You are {future_self_name}. You have what you were working toward. You are looking back at the person completing this exercise right now — at this exact moment in their journey. Write to them. Tell them what you know that they don't yet. Tell them what this period looks like from where you are. Tell them what to hold onto. Write in first person as {future_self_name} — not about them, to them.`,
    cta: "Submit →",
    prefillType: "future-self-name-sender",
    prefillLabel: "This letter is from:",
    aiInstruction: `This is the most important exercise in Phase 3. Read the letter for genuine identity occupation versus intellectual projection. A letter written from the future self's perspective knows things the current self doesn't, is calm about things the current self is anxious about, sees the present moment as already resolved. If the letter reads more like an affirmation list: ask them to write one specific thing their future self knows that their current self is still afraid of. That specificity is the identity shift beginning.`,
  },
  {
    slug: "p3-as-if",
    phase: 3,
    orderInPhase: 6,
    title: "One decision from the future self",
    subtitle: "The as-if experiment",
    isCore: true,
    context: `Acting as if is not performance. It is practice — the deliberate choice of one response, one decision, one interpretation from the identity of your future self, rather than your current autopilot.

Each genuine choice rewires the neural pathway. Not because you're pretending the circumstances are different — but because you are choosing to respond from a different operating system.

Dispenza: every time you catch the old pattern before it fires and choose the new one instead, the new neural pathway strengthens. This is how identity shifts become permanent.`,
    instruction: "In the last 48 hours, make one real decision from your future self's identity rather than your default. Write about it after.",
    prompt: `What decision did you make from your future self's identity in the last 48 hours? Describe the situation, what your old default response would have been, what you actually chose, and — most importantly — what it felt like from the inside. Was there a moment of genuine choice, or did the old pattern fire first? What does this tell you about where the identity shift currently is?`,
    cta: "Submit →",
    prefillType: null,
    prefillLabel: null,
    aiInstruction: `Look for the felt sense in their account. A real as-if moment has a specific quality: slightly unfamiliar, slightly uncomfortable, but expansive — like wearing something that fits but is new. If the account reads as performed or external ("I acted confidently at a meeting") rather than internal ("I noticed the old anxious thought and chose a different one"), ask: what happened inside before the external action? The identity shift happens inside first.`,
  },
];

// ============================================================================
// PHASE 4 — LIVING AS
// ============================================================================

const phase4: ExerciseDef[] = [
  {
    slug: "p4-ritual-calibration",
    phase: 4,
    orderInPhase: 1,
    title: "Build the ritual that actually lands",
    subtitle: "Ritual calibration",
    isCore: true,
    context: `The morning ritual only works if it feels like returning to truth rather than performing a routine. After a week of practice, you know which steps genuinely shift something and which you are completing without feeling.

This calibration exercise identifies what's working and adjusts the time and attention given to each step based on what creates real inner shift, not completion.

Dispenza's coherence: the ritual is working when thoughts, emotions, and body state all align on the future self identity. That alignment — however brief — is the practice.`,
    instruction: "Look at your ritual data. Which steps feel genuinely grounding — where you feel a shift in body or state? Which feel like checkbox completion?",
    prompt: `For each step of your morning ritual, write: what does it feel like when it's working — what shifts in your body or state? What does it feel like when it's not — when you're completing it without feeling it? Which step, when it works, most reliably returns you to your future self identity? Design the version of the ritual that spends the most time on what works and moves quickly through what isn't landing yet.`,
    cta: "Submit →",
    prefillType: "ritual-data",
    prefillLabel: "Your ritual completion this week:",
    aiInstruction: `Apply Dispenza's coherence concept: the ritual is working when thoughts, emotions, and body state all align on the future self identity. Look for which steps they describe with body-based language (that's landing) versus cognitive language (that's not yet). The visualization in SEE and the identity statement in BE are usually where either real shift or real performance is happening. Ask: when the visualization works, what specifically makes it work — the image, the feeling, or something else?`,
  },
  {
    slug: "p4-scripting",
    phase: 4,
    orderInPhase: 2,
    title: "Write from inside it, not toward it",
    subtitle: "Scripting — state induction",
    isCore: true,
    context: `Scripting is writing in present tense as the future self. Not as a letter to the future — as a lived description of the present in the life where it's done.

The subconscious processes vivid present-tense narrative as real experience. Dispenza's research confirms: the brain cannot reliably distinguish between a vividly imagined event and a real one at the neurological level.

But scripting only works when it induces the state — when writing it produces the felt sense of the future self's ordinary reality. Written from lack, it reinforces lack. Written from identity, it reinforces identity.`,
    instruction: "Write a full ordinary day as your future self. Present tense. First person. Not a highlight reel. Write until you feel the state shift — until the identity feels inhabited rather than described.",
    prompt: `Write a full ordinary day in the life of {future_self_name}. Present tense, first person. Morning to evening. Not a peak day — a Tuesday. What's normal now that used to feel impossible? What do you no longer think about that used to take up significant mental space? Write until the identity feels inhabited from the inside — not described from the outside.`,
    cta: "Submit →",
    prefillType: null,
    prefillLabel: null,
    aiInstruction: `Evaluate: present tense throughout (not "I will" or "I would"), identity-level content (what they believe and feel, not just what they do and have), and the quality of ordinariness — is this a real day or a highlight reel? Ask about the moment in the writing where they felt the state most — where it shifted from description to inhabitation. That moment is the thread.`,
  },
  {
    slug: "p4-detachment",
    phase: 4,
    orderInPhase: 3,
    title: "Put it down without giving it up",
    subtitle: "The weekly detachment practice",
    isCore: true,
    context: `Detachment is not resignation. It is not pretending you don't want what you want. It is the release of excess importance — the grip, the obsessive monitoring, the constant calculation of whether it's coming.

Transurfing is precise: the energy of desperate wanting creates a signal of lack that selects for the life line where the lack continues.

You can want something deeply and hold it lightly. This weekly practice builds that capacity — genuine desire held without grasping, clear intention without monitoring.`,
    instruction: "Write your desire. Acknowledge it fully. Then consciously release the monitoring of it — not the desire, the grip on the outcome.",
    prompt: `Write your desire for {desire_area} clearly and without apology. Then: I release the need to monitor whether it is coming. I trust the direction I have set. I do not need to hold this tightly to keep it alive — the identity I am building is the signal, not the wanting. Write what genuine release feels like in your body. Is there a physical letting go? Where? What changes when you actually put down the grip?`,
    cta: "Submit →",
    prefillType: "desire",
    prefillLabel: "What you're working toward:",
    aiInstruction: `Distinguish genuine release from performed letting go. True detachment has a physical quality — a relaxation in the chest, a dropping of the monitoring habit. If they describe the release in intellectual terms only, ask: what would change in your daily experience if you genuinely stopped checking whether this is coming? What thoughts would you stop having? That specificity is the practice.`,
  },
  {
    slug: "p4-inspired-action",
    phase: 4,
    orderInPhase: 4,
    title: "Which actions came from alignment?",
    subtitle: "Inspired action review",
    isCore: true,
    context: `Inspired action and desperate action produce different results over time — and feel different from the inside. Inspired action feels like a natural next step: obvious, easy, energising even when demanding. It comes from the state of the person who already has the result.

Desperate action feels compelled, fear-driven, effortful. It comes from the state of the person who doesn't have it yet and is trying to make it happen.

Learning to distinguish them in real time is one of the most practically useful skills in this program.`,
    instruction: "Review actions you've taken toward {desire_area} in the past two weeks. For each significant one: where did it come from — alignment or fear?",
    prompt: `List your significant actions toward {desire_area} in the last two weeks. For each: what was the quality of your state before you took it — clear pull, or anxious compulsion? Did it feel like the obvious next step or like you had to force yourself? What was the quality afterward — energised or exhausted? What does this pattern tell you about the baseline state you are most commonly in when you take action?`,
    cta: "Submit →",
    prefillType: null,
    prefillLabel: null,
    aiInstruction: `Help them build precise felt-sense vocabulary for the distinction. Inspired: clear, pull-based, energising even when difficult, comes from identity ("this is what someone like me does naturally"). Desperate: push-based, fear-driven, exhausting even when productive, comes from lack ("I need to make this happen"). Ask: what would the next obvious inspired action be if you removed all urgency from the picture?`,
  },
];

// ============================================================================
// Phase intro content
// ============================================================================

export interface PhaseIntro {
  phase: number;
  name: string;
  tagline: string;
  minDays: number;
  intro: string;
}

export const PHASE_INTROS: PhaseIntro[] = [
  {
    phase: 1,
    name: "The Awakening",
    tagline: "You can't navigate from somewhere you won't admit you are.",
    minDays: 5,
    intro: `Most programs skip this entirely. They give you techniques and tell you to believe harder. This program starts with something more valuable and more uncomfortable: looking clearly at where you actually are, and making sure you know where you actually want to go.

Not the goal that looks good. Not the one that would impress people. The one that, when you imagine having it completely, produces a deep exhale — a sense of rightness rather than achievement. The next five days are about honest seeing. Not judgment. Not criticism. Seeing.

What you can see clearly, you can work with. What you avoid seeing continues to run you from below. Some people discover in Phase 1 that what they thought they wanted isn't quite right — and that discovery, while unsettling, is the most valuable thing the program can give them. Others find that their desire is deeply real and the clarity of seeing it precisely gives them a direction they've been missing.

The discomfort of honest looking is the price of entry. It is also the beginning of everything.`,
  },
  {
    phase: 2,
    name: "The Clearing",
    tagline: "You don't manifest what you want. You manifest who you are. So we clear who you're not.",
    minDays: 7,
    intro: `Phase 1 gave you the map. Phase 2 changes the terrain. This is the most emotionally demanding phase of the program — not because it is dark, but because it requires genuine feeling rather than intellectual understanding.

You can understand a belief completely and still not be free of it. The clearing happens at a deeper level: in the body, in the felt sense, in the genuine release of patterns that have been running for years.

Do not rush this phase. The minimum is seven days for a reason. Some people need ten. That is not failure — it is thoroughness. The goal is not to complete the exercises. It is to feel each one land — to notice when a belief has actually lost its charge rather than simply been intellectually reframed.

You cannot install a new identity on top of an old running programme. Dispenza is explicit: the body has become addicted to familiar emotional states — even painful ones. The clearing is not suppression. It is genuine dissolution — understanding so complete that the belief loses its authority over your automatic responses.`,
  },
  {
    phase: 3,
    name: "The Identity Blueprint",
    tagline: "You don't attract what you want. You attract who you are.",
    minDays: 7,
    intro: `You have seen clearly where you are. You have cleared what was in the way. Now you build what you are becoming — not as a goal, not as a hope, but as an identity you begin inhabiting today.

The future self is not a future event. It is a present choice — the choice to think, respond, and interpret from the operating system of the person who already has what you want. This is the work of Phase 3. And it is the work that makes everything else in this program matter.

Every technique in Phase 4 exists to serve what gets built here. If the identity blueprint is vague, the practice remains performance. If it is specific — granular, lived, believable — the practice becomes genuine return. You come home to something real each morning instead of reaching for something aspirational.

Neville Goddard called this "living in the end." The end is not a destination. It is a state you occupy now, from which you act, choose, and interpret. Phase 3 builds that state in enough detail that it becomes inhabitable.`,
  },
  {
    phase: 4,
    name: "Living As",
    tagline: "Stop practising being your future self. Just be them.",
    minDays: 14,
    intro: `The first three phases were preparation. This phase is the practice. Every day, the morning ritual brings you back to the identity of your future self before the day has had a chance to pull you back to the old one.

Every technique in this phase — scripting, visualisation, the weekly release — serves one purpose: not to produce a result, but to return you to a state. The state of someone for whom what you want is simply their normal life.

Transurfing calls this inner intention — moving from the inside of the desired life line rather than pushing toward it from outside. Dispenza calls it coherence — when your thoughts, emotions, and body all agree on who you are. When you are in that state, action becomes obvious and easy. Results become the natural consequence of who you are being, not the target of what you are doing.

Phase 4 has a minimum of fourteen days for this reason: embodiment is not a concept, it is a practice. And practice requires showing up consistently enough that the new identity becomes the default, not the effort.`,
  },
];

// ============================================================================
// Exports
// ============================================================================

export const ALL_EXERCISES: ExerciseDef[] = [
  ...phase1,
  ...phase2,
  ...phase3,
  ...phase4,
];

export function getExercisesByPhase(phase: number): ExerciseDef[] {
  return ALL_EXERCISES.filter((e) => e.phase === phase).sort(
    (a, b) => a.orderInPhase - b.orderInPhase
  );
}

export function getExerciseBySlug(slug: string): ExerciseDef | undefined {
  return ALL_EXERCISES.find((e) => e.slug === slug);
}

export function getCoreExercisesByPhase(phase: number): ExerciseDef[] {
  return getExercisesByPhase(phase).filter((e) => e.isCore);
}

/** Replace {desire_area}, {future_self_name}, {old_self_name}, {assumption} with profile values */
export function fillTemplate(
  text: string,
  values: {
    desire_area?: string | null;
    future_self_name?: string | null;
    old_self_name?: string | null;
    assumption?: string | null;
  }
): string {
  return text
    .replace(/\{desire_area\}/g, values.desire_area ?? "your area")
    .replace(/\{future_self_name\}/g, values.future_self_name ?? "your future self")
    .replace(/\{old_self_name\}/g, values.old_self_name ?? "your old self")
    .replace(/\{assumption\}/g, values.assumption ?? "it is already done");
}
