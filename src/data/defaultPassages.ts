import { GmatPassage } from '../types';

export const defaultPassages: GmatPassage[] = [
  {
    id: "bio-1",
    title: "Mitochondrial Endosymbiosis and the Metabolic Paradox",
    discipline: "biology",
    difficulty: "700-750",
    content: "The endosymbiotic theory, which posits that eukaryotic organelles such as mitochondria and chloroplasts originated as free-living prokaryotes engulfed by an ancestral nucleated cell, is widely accepted as a cornerstone of evolutionary biology. However, reconciling this phylogenetic transition with the thermodynamic mechanics of early metabolic consolidation remains an area of ongoing debate. Prior to endosymbiosis, the host cell, presumably an archaeon of the Asgard superphylum, depended on an anaerobic, heterotrophic pathway that was highly restricted in energetic output. The proto-mitochondrial symbiont, an alpha-proteobacterium, brought with it the machinery for oxidative phosphorylation, a process that dramatically amplified ATP yield per molecule of glucose oxidized.\n\nYet, this metabolic alignment was not without severe friction. The synthesis of ATP via the electron transport chain generates cellular reactive oxygen species (ROS) as natural, highly toxic byproducts. These ROS possess the property of mutating DNA, which, in the primordial eukaryote, was not yet physically separated from the respiratory hub. The evolutionary pressure exerted by mitochondrial mutational load likely catalyzed the compartmentalization of the host's genome, thereby driving the formation of the double-membrane cell nucleus. This nuclear envelopment sequestered the susceptible genetic material from the high-radiation mitochondrial zone, enabling the evolutionary leap toward complex multicellularity that would otherwise have been stymied by a prohibitive mutation-to-protein-stability ratio.",
    terms: [
      {
        term: "endosymbiotic theory",
        definition: "The evolutionary theory stating that organelles like mitochondria originated as free-living bacteria that were engulfed by a host cell.",
        plainEnglish: "The idea that big cells got their internal power-plants by swallowing smaller cells, which then stayed inside and worked for them.",
        gmatTip: "The GMAT loves biology passages about cooperation or transitions. Don't worry about the organic details; focus on the outcome of this partnership."
      },
      {
        term: "oxidative phosphorylation",
        definition: "A metabolic pathway that uses energy released by the oxidation of nutrients to produce adenosine triphosphate (ATP), the chemical energy currency of cells.",
        plainEnglish: "The main chemical process cells use to make energy when oxygen is present. It acts as an incredibly efficient engine.",
        gmatTip: "When you see dense terms like 'oxidative phosphorylation,' replace them mentally with 'efficient energy production.' Don't let the vocabulary halt your reading speed."
      },
      {
        term: "reactive oxygen species (ROS)",
        definition: "Chemically reactive molecules containing oxygen, often produced as byproducts of cellular respiration, which can damage DNA.",
        plainEnglish: "Highly corrosive oxygen molecules that can damage a cell's inner wiring and cause genetic mutations.",
        gmatTip: "Treat ROS as 'the bad byproduct.' GMAT passages often introduce a 'negative consequence' of an otherwise beneficial biological upgrade."
      },
      {
        term: "Asgard superphylum",
        definition: "A proposed group of archaea that are the closest evolutionary relatives of eukaryotes.",
        plainEnglish: "An ancient group of simple, single-celled microbes that are the ancient ancestors of all animal and plant cells.",
        gmatTip: "Proper nouns in GMAT science passages are distractors. If it's capitalized, it is just a label for a specific actor. Just think: 'Host microbes.'"
      }
    ],
    complexSentences: [
      {
        sentence: "The evolutionary pressure exerted by mitochondrial mutational load likely catalyzed the compartmentalization of the host's genome, thereby driving the formation of the double-membrane cell nucleus.",
        simplified: "Mitochondrial mutations forced the host cell to hide its DNA inside a core nucleus to protect it.",
        subject: "The evolutionary pressure (exerted by mitochondrial mutational load)",
        mainVerb: "catalyzed (and drove)",
        modifiers: [
          "exerted by mitochondrial mutational load (describing what kind of pressure)",
          "thereby driving the formation of... (showing the result/consequence of this catalyst)"
        ]
      },
      {
        sentence: "This nuclear envelopment sequestered the susceptible genetic material from the high-radiation mitochondrial zone, enabling the evolutionary leap toward complex multicellularity that would otherwise have been stymied by a prohibitive mutation-to-protein-stability ratio.",
        simplified: "This separation kept DNA safe, allowing cells to safely evolve into complex creatures instead of being destroyed by mutations.",
        subject: "This nuclear envelopment",
        mainVerb: "sequestered",
        modifiers: [
          "from the high-radiation mitochondrial zone (direction of separation)",
          "enabling the evolutionary leap toward... (describing the macro effect)",
          "that would otherwise have been stymied... (describing a counterfactual condition)"
        ]
      }
    ],
    questions: [
      {
        id: "bio-1-q1",
        questionText: "Which of the following best states the main idea of the passage?",
        questionType: "Reading Comprehension",
        subType: "Main Idea",
        options: [
          "The evolutionary transition from prokaryotic Asgard archaea to eukaryotes is primarily a thermodynamic mystery.",
          "While mitochondrial endosymbiosis significantly boosted cell energy capacity, it also introduced genetic hazards that compelled nuclear compartmentalization.",
          "Oxidative phosphorylation is a highly volatile pathway that ultimately inhibits the development of complex multicellular organisms.",
          "The double-membrane cell nucleus evolved as a direct physical barrier to prevent mitochondria from reproducing independently.",
          "The Asgard superphylum microbes failed to thrive due to a high mutational load that damaged their primary metabolic apparatus."
        ],
        correctAnswerIndex: 1,
        explanation: {
          correct: "Option B correctly captures the two core concepts in the passage: (1) the massive energetic boost mitochondria provided, and (2) the toxic ROS mutations that pressured cells to create a nucleus to isolate their genetic material.",
          incorrect: {
            0: "Option A is too narrow; the passage refers to this 'paradox' but then explains a model that resolves the evolutionary tension.",
            2: "Option C contradicts the passage; oxidative phosphorylation actually 'amplified ATP yield' and ultimately enabled multicellularity, once the nuclear safeguard developed.",
            3: "Option D is incorrect because the nucleus was developed to keep DNA away from chemical mutation hazards (ROS), not to stop mitochondria from replicating.",
            4: "Option E is incorrect; Asgard archaea lived anaerobically and didn't exhibit high oxidative stress until after endosymbiosis with the alpha-proteobacterium."
          },
          gmatStrategy: "A perfect GMAT 'Main Idea' answer must encompass both the main premise (mitochondria boost energy) and the developer's subsequent twist/complication (the oxidative damage resulting in nuclear evolution)."
        }
      },
      {
        id: "bio-1-q2",
        questionText: "The passage suggests that if Asgard superphylum cells had attempted complex multicellularity without nuclear compartmentalization, they would have:",
        questionType: "Reading Comprehension",
        subType: "Inference",
        options: [
          "Failed to synthesize ATP in sufficient quantities due to Asgard heterotrophy.",
          "Suffered extreme energetic scarcity due to a complete absence of oxidative cellular structures.",
          "Been restricted by unstable genetic material caused by high exposure to metabolic reactive oxygen species.",
          "Evolved more specialized mitochondria to suppress toxic chemical emissions of superoxide.",
          "Succeeded through other non-respiratory anaerobic chemical mechanisms."
        ],
        correctAnswerIndex: 2,
        explanation: {
          correct: "Option C is supported by the final sentence, which indicates that 'evolutionary leap toward complex multicellularity... would otherwise have been stymied by a prohibitive mutation-to-protein-stability ratio' (caused by the ROS mutagenic load close to DNA).",
          incorrect: {
            0: "Option A is incorrect because ATP production was solved by the endosymbiont; the issue preventing multicellularity was mutational damage, not ATP quantity directly.",
            1: "Option B is incorrect because they did have the endosymbiont (the oxidative structure).",
            3: "Option D is incorrect because nothing in the passage suggests they could 'suppress' emissions by evolving specialized mitochondria.",
            4: "Option E is incorrect because the passage implies oxygen respiration was necessary for multicellularity's major energy footprint."
          },
          gmatStrategy: "In GMAT Inference questions, look for information that is 'disguised' as a direct logical consequence of a statement in the text. Here, the 'would have been stymied' directly translates to 'would have been restricted'."
        }
      }
    ],
    scoreBoostTips: [
      "De-jargonize: When GMAT throws complex phrases like 'alpha-proteobacterium,' write 'microbe' in your mind. Focus on relationships, not nouns.",
      "Track the pivots: Notice keywords like 'However' or 'Yet.' They alert you to the critical twist that GMAT questions usually test.",
      "Structure over factual retention: Don't memorize how ROS damages DNA; instead, note that ROS is a 'negative side-effect' that led to a 'solution' (the nucleus)."
    ]
  },
  {
    id: "phys-1",
    title: "The Copper-Oxide Puzzle in High-Temperature Superconducting States",
    discipline: "physics",
    difficulty: "750+",
    content: "Under classical BCS (Bardeen-Cooper-Schrieffer) theory, superconductivity—the complete disappearance of electrical resistance below a critical transitional temperature (Tc)—occurs when electrons overcome their natural Coulomb repulsion to form pairs known as Cooper pairs. These pairs are mediated by lattice vibrations, or phonons, which form a attractive potential field in which electrons flow in quantum-mechanical synchronization. However, classical BCS theory dictates a theoretical ceiling for superconductivity at approximately 30 Kelvin, as thermal fluctuations at higher temperatures disrupt the fragile electron-phonon interaction.\n\nThe discovery of cuprate (copper-oxide) ceramics in 1986, which exhibit superconducting properties at temperatures exceeding 130 Kelvin, shattered this BCS constraint, precipitating a paradigm shift in condensed matter physics. In these materials, the mechanism underlying Cooper pairing cannot be attributed merely to simple phonon exchange. Instead, physicists hypothesize that magnetic fluctuations within the two-dimensional copper-oxygen planar sheets provide the attractive glue. The copper atoms in these planes form a Mott insulator where strong electron-electron correlations stifle conduction. When 'doped'—a process wherein charge carriers are chemically introduced by replacing atoms in adjacent layers—the Mott insulation breaks down, and electrons participate in a complex dance where magnetic spins align in anti-ferromagnetic fluctuations, mediating pairs with exceptionally heavy binding energy that resists thermal degradation at liquid-nitrogen temperatures.",
    terms: [
      {
        term: "BCS theory",
        definition: "The microscopic theory of superconductivity proposed in 1957, stating that electrons form Cooper pairs through lattice vibration mediation.",
        plainEnglish: "The old rulebook that said metals can only conduct electricity without friction when cooled nearly to absolute zero.",
        gmatTip: "The GMAT loves the contrast between 'old theory/assumption' and 'new discovery.' Always track the limitations of the old theory."
      },
      {
        term: "Cooper pairs",
        definition: "Pairs of electrons bound together at very low temperatures, which behave like a single particle and can travel through a lattice without resistance.",
        plainEnglish: "Electrons that pair up to work in perfect sync, sliding past atoms without slamming into them and losing energy.",
        gmatTip: "Notice that Cooper pairs are the standard 'heroes' of the passage, regardless of whether the material is old or new."
      },
      {
        term: "Mott insulator",
        definition: "A class of materials that should conduct electricity under conventional band theories but behave as insulators due to strong electron-electron interactions.",
        plainEnglish: "Materials that should let electricity flow, but are blocked because the electrons are too crowded and reject each other.",
        gmatTip: "In GMAT, when a passage describes a paradox—like a conductor that acts as an insulator—the GMAT is highly likely to test why this material is unusual."
      }
    ],
    complexSentences: [
      {
        sentence: "However, classical BCS theory dictates a theoretical ceiling for superconductivity at approximately 30 Kelvin, as thermal fluctuations at higher temperatures disrupt the fragile electron-phonon interaction.",
        simplified: "Old theories limit superconductivity to cold levels because heat breaks the electron connection.",
        subject: "classical BCS theory",
        mainVerb: "dictates",
        modifiers: [
          "as thermal fluctuations disrupt... (explaining the cause of the restriction)",
          "fragile electron-phonon interaction (describing what gets disrupted)"
        ]
      },
      {
        sentence: "The copper atoms in these planes form a Mott insulator where strong electron-electron correlations stifle conduction.",
        simplified: "Copper atoms block electricity because electrons crowd and repel one another.",
        subject: "The copper atoms",
        mainVerb: "form",
        modifiers: [
          "where strong correlations stifle conduction (subordinate clause defining high-resistance behavior)"
        ]
      }
    ],
    questions: [
      {
        id: "phys-1-q1",
        questionText: "The passage is primarily concerned with doing which of the following?",
        questionType: "Reading Comprehension",
        subType: "Structure",
        options: [
          "Defending classical BCS theory against critics who challenge its microscopic accuracy.",
          "Detailing how Cooper pairs are formed in low-temperature metals under high pressure conditions.",
          "Explaining why cuprate materials fail to achieve physical resistance reduction above 30 Kelvin.",
          "Discussing an experimental exception to an established physical rule and the proposed theory behind it.",
          "Recommending chemical modifications to cuprates to eliminate anti-ferromagnetic fluctuations."
        ],
        correctAnswerIndex: 3,
        explanation: {
          correct: "Option D accurately describes the passage structure: it introduces an exception (cuprates discovered in 1986 that superconduct above 30 Kelvin) to an established rule (BCS theory's 30K ceiling) and explains the proposed theory (magnetic fluctuations / anti-ferromagnetic spin alignment).",
          incorrect: {
            0: "Option A is incorrect because the passage outlines a major exception that classical BCS theory cannot explain, rather than defending it.",
            1: "Option B is too narrow and describes the old BCS method, not the primary focus of the overall passage.",
            2: "Option C is a factual contradiction; cuprates superconduct *well above* 30 Kelvin (exceeding 130 Kelvin).",
            4: "Option E is incorrect because magnetic fluctuations are described as the positive 'glue' enabling high-temp superconductivity, not a problem needing elimination."
          },
          gmatStrategy: "Focus on the verbs in the options. Look for words like 'Discussing,' 'Evaluating,' or 'Contrasting' that accurately describe the relationship between classical theory and the new discovery."
        }
      },
      {
        id: "phys-1-q2",
        questionText: "Based on the passage, 'doping' refers to a procedure that:",
        questionType: "Reading Comprehension",
        subType: "Detail",
        options: [
          "Cools a cuprate ceramic down to 30 Kelvin to restore classical BCS phonon interaction.",
          "Synthesizes heavy copper-oxide sheets to amplify thermal resistance.",
          "Chemical replacement of atoms in adjacent layers to disrupt Mott insulation in the copper planes.",
          "Constructs specialized lattices that eliminate quantum-mechanical Cooper pairing.",
          "Accelerates Coulomb repulsion to convert cuprates into superconductive metals."
        ],
        correctAnswerIndex: 2,
        explanation: {
          correct: "Option C is directly supported by the text: 'doped—a process wherein charge carriers are chemically introduced by replacing atoms in adjacent layers—the Mott insulation breaks down...'",
          incorrect: {
            0: "Option A is incorrect; doping is used to get superconductivity *without* resting on BCS phonon rules.",
            1: "Option B is incorrect; doping changes the charge carriers, it doesn't create 'heavy' physical sheets.",
            3: "Option D is incorrect; Cooper pairing is *required* for superconductivity, so eliminating it would stop the phenomenon.",
            4: "Option E is incorrect because Cooper partners must *overcome* Coulomb repulsion to bind, not accelerate it."
          },
          gmatStrategy: "For Detail questions, look for synonyms of the words in the text. 'Disrupt Mott insulation' is the direct paraphrase of 'the Mott insulation breaks down.'"
        }
      }
    ],
    scoreBoostTips: [
      "Ignore numbers: If GMAT says 'Tc below 130 Kelvin,' treat it as a concept ('warmer temperatures'). The numbers are just details to prevent you from focusing on the logic.",
      "The Catalyst: Look for what triggers change. Doping takes a material that is stuck (Mott insulator) and activates conduction. That trigger is a frequent target of inference questions.",
      "Analogous thinking: If Cooper pairs slide without friction, think of them as an ice skater on a frictionless rink."
    ]
  },
  {
    id: "astro-1",
    title: "Astronomy's Element Factories: The r-Process in Core-Collapse events",
    discipline: "astronomy",
    difficulty: "700-750",
    content: "The origin of elements heavier than iron in the universe long posed a stellar conundrum. Standard nucleosynthesis inside main-sequence stars easily explains the creation of elements up to iron (Fe), where nuclear fusion is thermodynamically favorable. However, fusing nuclei beyond iron is endothermic—requiring more energy than it releases—making stellar cores ineffective sites for generating heavy isotopes such as gold, platinum, and uranium. To bypass this energetic barrier, nature utilizes neutron capture processes. Under the slow neutron capture process, or 's-process,' which takes place over thousands of years in giant stars, seeds incrementally absorb neutrons; any unstable nuclei generated have ample time to decay back to stable trajectories before another neutron collision occurs.\n\nTo synthesize extremely neutron-rich isotopes, however, requires a rapid capture mechanism—the 'r-process'—where atomic nuclei are inundated with an immense flux of neutrons on a millisecond timescale, surpassing the rate of beta-decay. This violent cascade occurs only in highly energetic astrophysical sites: either core-collapse supernovae or the mergers of binary neutron stars. In these extreme environments, free neutron densities are so extreme that stable seed nuclei, such as iron-56, are saturated with successive neutrons faster than they can rearrange their quantum structures, forming short-lived 'exotic' elements. As the physical environment cools and the neutron bombardment ceases, these unstable isotopes undergo successive radioactive beta-minus decays, where neutrons transform into protons, ultimately stabilizing as the heavy, highly valuable metals that form rocky terrestrial crusts.",
    terms: [
      {
        term: "endothermic",
        definition: "A chemical or nuclear reaction that absorbs energy rather than releasing it.",
        plainEnglish: "An process that sucks in heat or energy, whereas exothermic processes push energy out.",
        gmatTip: "The GMAT is checking if you understand boundaries. Iron is the limit because past it, stars must spend energy instead of earning it."
      },
      {
        term: "r-process",
        definition: "The rapid neutron-capture process, creating neutron-rich isotopes during nucleosynthesis in violent cosmic events.",
        plainEnglish: "A super-fast neutron machine gun that floods atoms so quickly they don't have time to fall apart before getting bigger.",
        gmatTip: "Track the differences between the 'slow' (s-process) and 'rapid' (r-process) tracks. GMAT loves comparison tables in passage questions."
      },
      {
        term: "beta-minus decay",
        definition: "A type of radioactive decay where a neutron is transformed into a proton, emitting an electron and an antineutrino.",
        plainEnglish: "An unstable nucleus converting one of its excess neutrons into a proton to stabilize itself, which changes it into a completely new element.",
        gmatTip: "Understand the 'stabilization step.' Beta decay is what turns those unstable 'exotic' elements into final stable elements like gold."
      }
    ],
    complexSentences: [
      {
        sentence: "To synthesize extremely neutron-rich isotopes, however, requires a rapid capture mechanism—the 'r-process'—where atomic nuclei are inundated with an immense flux of neutrons on a millisecond timescale, surpassing the rate of beta-decay.",
        simplified: "Creating super heavy elements requires a rapid flood of neutrons that hits atoms quicker than they can decay.",
        subject: "(To synthesize...) requires a rapid capture mechanism (the r-process)",
        mainVerb: "requires",
        modifiers: [
          "where atomic nuclei are inundated... (relative clause describing the r-process environment)",
          "surpassing the rate of beta-decay (comparing rates of two simultaneous operations)"
        ]
      }
    ],
    questions: [
      {
        id: "astro-1-q1",
        questionText: "Which of the following describes the relationship between the s-process and the r-process as discussed in the passage?",
        questionType: "Critical Reasoning",
        subType: "Structure",
        options: [
          "They are competing evolutionary processes that cancel each other's effects inside supernova remnants.",
          "The s-process is an endothermic reaction whereas the r-process is an exothermic reaction.",
          "The s-process relies on continuous, slow neutron absorption allowing decay between steps, while the r-process floods seeds with neutrons faster than they can decay.",
          "The s-process requires extreme binary neutron star mergers, whereas the r-process happens inside common main-sequence stars.",
          "The s-process only occurs after the r-process has stabilized through beta-minus decay."
        ],
        correctAnswerIndex: 2,
        explanation: {
          correct: "Option C correctly contrasts the two processes based on the speed of neutron absorption relative to the rate of radioactive decay, which is the main distinction highlighted.",
          incorrect: {
            0: "Option A is incorrect because they don't cancel each other out; they synthesize different classes of heavy isotopes.",
            1: "Option B is incorrect; the energy barriers are not defined this way, but rather of the general endothermic fusion restriction past iron.",
            3: "Option D is a reversal; the s-process is slow/gentle (takes place over thousands of years in giant stars) while r-process is rapid/extreme (binary neutron star mergers).",
            4: "Option E is incorrect; s-process happens during standard stellar lifespans, long before core-collapse triggers the heavy r-process supernova."
          },
          gmatStrategy: "In GMAT science comparisons, check for reverse logic. Options that switch the definitions of the two things are extremely common trap answers."
        }
      },
      {
        id: "astro-1-q2",
        questionText: "The author mentions 'iron-56' in the second paragraph primarily to:",
        questionType: "Critical Reasoning",
        subType: "Detail",
        options: [
          "Provide an example of an element that is extremely rare in core-collapse supernovae.",
          "Identify a stable seed nucleus that absorbs neutrons during the rapid r-process synthesis.",
          "Prove that fusion reactions past iron do not absorb stellar energy.",
          "Demonstrate that main-sequence stars cannot generate iron under regular conditions.",
          "Highlight a metal that is too unstable to support beta-decay transitions."
        ],
        correctAnswerIndex: 1,
        explanation: {
          correct: "Option B is correct; the passage states: 'where stable seed nuclei, such as iron-56, are saturated with successive neutrons...'",
          incorrect: {
            0: "Option A contradicts the text; iron-56 acts as a seed in these environments.",
            2: "Option C is a reversal of the endothermic limitation discussed.",
            3: "Option D is incorrect; main-sequence stars easily create iron (thermodynamically favorable fusion).",
            4: "Option E is incorrect; iron-56 is a 'stable' nucleus."
          },
          gmatStrategy: "Always find the exact target word ('iron-56') in the text and read one sentence before and after. The context tells you it acts as a 'stable seed' designed to absorb rapid neutrons."
        }
      }
    ],
    scoreBoostTips: [
      "Process Sequencing: Build a timeline. Fusion stops at Iron -> Neutron capture begins -> s-process (slow decay) or r-process (fast overload) -> Cooling -> Beta-minus decay converts neutrons to protons -> Stable Gold/Platinum.",
      "Energetic boundaries: Notice when an author sets a boundary ('fusing nuclei beyond iron is endothermic'). Focus on why stars 'need' a new method (neutron capture) to cross that boundary.",
      "The 'Why' behind details: The author doesn't care about the properties of iron-56 itself; they use it to show *how* a stable starting point transforms in a supernova."
    ]
  }
];
