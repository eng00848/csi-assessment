export const NARRATIVES = {
  conserver: {
    mild: {
      label: "Mild Conserver", range: "diff 10–16",
      intro: "You have a quiet preference for structure and familiar approaches. You can adapt when circumstances require it, but you naturally gravitate toward proven methods and steady progress over radical shifts. While you appreciate stability, you are not inflexible — you simply prefer change that is well-reasoned and grounded.",
      strengths: ["Reliable and consistent in delivery","Brings calm and stability to uncertain situations","Good at refining and improving existing processes","Balances attention to detail with flexibility when needed","Trusted by colleagues to follow through on commitments"],
      challenges: ["May hesitate slightly longer than needed before acting","Can default to familiar solutions even when fresh thinking is warranted","May underestimate the urgency others feel around change","Occasional risk of missing the bigger picture while focusing on details"],
    },
    moderate: {
      label: "Moderate Conserver", range: "diff 17–29",
      intro: "You have a clear and consistent preference for incremental, well-planned change. You value working within established rules and systems, and bring thoroughness and dependability to everything you do. You are at your best when change is thoughtful, justified, and carefully implemented rather than rushed or reactive.",
      strengths: ["Excellent at implementation, follow-through, and execution","Protects team and organizational resources with care","Strong attention to detail and factual information","Keeps teams grounded and focused during periods of uncertainty","Skilled at creating plans that others can reliably follow"],
      challenges: ["May resist change that is actually necessary or long overdue","Can appear rigid or inflexible, especially to Originators","Perfectionism may slow decision-making under time pressure","Risk of over-focusing on details at the expense of the big picture","May unintentionally discourage creative or unconventional thinking"],
    },
    strong: {
      label: "Strong Conserver", range: "diff 30–60",
      intro: "You have a deep and strong preference for order, tradition, and predictability. Rapid or unplanned change may feel genuinely disorienting or counterproductive. You are at your best when you can plan thoroughly, operate within clear structures, and build upon what has already been proven to work.",
      strengths: ["Highly disciplined, organized, and methodical in approach","Outstanding steward of processes, resources, and institutional knowledge","Deeply reliable — colleagues always know what to expect from you","Skilled at taking new ideas and creating practical implementation plans","Keeps organizations anchored during periods of turbulent change"],
      challenges: ["May strongly resist change even when it is clearly necessary","Can unintentionally stifle innovation or suppress new thinking","May be perceived as unyielding, cautious, or set in their ways","Difficulty seeing beyond current details to understand the broader context","May delay action through excessive reflection or perfectionism"],
    },
  },
  pragmatist: {
    mild: {
      label: "Mild Pragmatist", range: "diff 0–4",
      intro: "You sit almost exactly at the center of the continuum — highly adaptable and genuinely able to shift between Conserver and Originator approaches depending on what the situation calls for. You read context intuitively and adjust your style accordingly, making you a versatile and trusted contributor in most team environments.",
      strengths: ["Exceptional situational flexibility and adaptability","Trusted by both Conservers and Originators equally","Skilled at reading what a situation needs and responding accordingly","Natural bridge-builder between opposing perspectives","Rarely triggers conflict due to their even-handed approach"],
      challenges: ["May lack a strong personal stance when decisive leadership is needed","Can appear uncommitted or difficult to read by stronger-style colleagues","May defer too easily to more dominant personalities in the room","Risk of being pulled in opposing directions by both sides simultaneously"],
    },
    moderate: {
      label: "Moderate Pragmatist", range: "diff 5–7",
      intro: "You are comfortably in the middle of the continuum, with a clear preference for practical, outcome-driven approaches to change. You are a natural mediator and collaborator, focused first and foremost on what will actually work. You understand and respect structure without being bound by it.",
      strengths: ["Highly effective at facilitating group problem-solving and consensus","Builds cooperation across different styles and perspectives","Translates ideas into tangible, workable action plans","Adapts past experience effectively to new and unfamiliar situations","Encourages congruence between values and actions in organizations"],
      challenges: ["May over-focus on building consensus at the cost of speed","Can be seen as indecisive or slow to commit to a clear direction","May negotiate a compromise that ultimately satisfies no one fully","Risk of trying to please too many stakeholders at the same time","Can appear to flip-flop on issues when pulled in different directions"],
    },
    strong: {
      label: "Strong Pragmatist", range: "diff 8–9",
      intro: "You are firmly anchored in the pragmatist space — highly skilled at seeing all perspectives and finding the most workable path forward. You are a deliberate and skilled mediator, able to bridge long-range goals with short-term demands. Colleagues at the extremes may find you frustratingly noncommittal, but your objectivity is a genuine organizational strength.",
      strengths: ["Excellent at navigating conflict and tension between opposing styles","Keeps teams focused on practical outcomes rather than ideology","Bridges long-range strategic goals with immediate operational demands","Seen as fair, balanced, and trustworthy by most team members","Skilled at bringing divergent groups to a workable shared outcome"],
      challenges: ["May appear to lack conviction or personal drive to strong styles","Can be perceived as hiding behind team needs rather than taking a stand","May be too easily swayed by the last persuasive voice heard","Risk of being seen as noncommittal, indecisive, or overly accommodating"],
    },
  },
  originator: {
    mild: {
      label: "Mild Originator", range: "diff 10–16",
      intro: "You are drawn to novelty and enjoy challenging the way things are done, but you remain grounded enough to work within structures when the situation requires it. You bring fresh thinking and creative energy to teams without completely unsettling those around you. Your change-agent instincts are tempered by a degree of practical awareness.",
      strengths: ["Generates creative ideas while remaining approachable and inclusive","Can challenge norms and assumptions without alienating Conservers","Good balance of visionary thinking and practical awareness","Energizes teams with possibility thinking and forward momentum","Comfortable taking calculated risks without reckless disregard for structure"],
      challenges: ["May still move faster than some teammates are comfortable with","Can occasionally overlook important implementation details","May underestimate colleagues' genuine need for certainty and structure","Occasional impatience with processes that feel slow or bureaucratic"],
    },
    moderate: {
      label: "Moderate Originator", range: "diff 17–29",
      intro: "You have clear change-agent energy. You are comfortable with risk and uncertainty, challenge conventions regularly, and are often viewed by others as visionary. You likely see the status quo as a problem to be solved rather than a baseline to protect. You are energized by new and complex challenges.",
      strengths: ["Inspires and communicates a compelling vision of the future","Builds commitment and enthusiasm for change in those around you","Values continuous learning and growth in the work environment","Translates high-level organizational vision into individual action","Comfortable leading through ambiguity and uncertainty"],
      challenges: ["May lack patience for team problem-solving and collaborative processes","Important details and tasks can fall through the cracks","May struggle with goal alignment and coordination across functions","Can appear impractical, unconventional, or undisciplined to others","May move on to the next idea before fully completing the current one"],
    },
    strong: {
      label: "Strong Originator", range: "diff 30–60",
      intro: "You strongly prefer fast, radical, and disruptive change. You challenge existing rules, policies, and structures reflexively. You thrive at the start of new ventures and your ability to generate ideas and challenge the status quo is exceptional. However, sustained implementation and disciplined follow-through may be significant challenges.",
      strengths: ["Fearless challenger of the status quo and conventional thinking","Produces many divergent, boundary-pushing, and imaginative ideas","Highly energetic and enthusiastic catalyst for large-scale transformation","Sees possibilities and opportunities that others simply do not imagine","Thrives in environments with high ambiguity, complexity, and change"],
      challenges: ["May create significant chaos, disruption, and lack of discipline","Can become lost in theory, ignoring practical current realities","Often underestimates the short-term human impact of rapid change on others","Frequently moves to new ideas or projects before completing existing ones","May not adapt well to new policies and procedures once established","May overlook the value of engaging key stakeholders for implementation"],
    },
  },
}

export const STYLE_INFO = {
  conserver: {
    color: "#185FA5", light: "#E6F1FB", textColor: "#0C447C",
    facing: ["Prefers change that maintains the integrity of current structure","May operate from conventional assumptions","Enjoys predictability and structured environments","May appear cautious and inflexible to others","Tends to focus on details and established routine"],
    contributing: ["Gets things done on schedule and within agreed parameters","Works well within organizational structure and constraints","Attends carefully to detail and factual information","Demonstrates strong follow-through skills","Encourages and adheres to proven processes"],
    leading: ["Leads through reliable, stable, and consistent behavior","Rewards following the norms while getting the job done","Attends to practical organizational needs","Expects organizational policies and procedures to be followed","Promotes the traditional values of the organization"],
    innovation: ["Skilled at taking new ideas and creating a plan for implementation","Attends to detail and follows through until implementation is completed","Ensures desired results are obtained and standards met"],
    collaborating: ["Resists decisions that create chaos or disrupt existing systems","Encourages building on what is already working","Focuses on agreed-upon goals and objectives"],
    perceivedBy: {
      originator: ["Stubborn","Bureaucratic","Yielding to authority","Unaware of competitive demands","Supporting the status quo","Lacking new ideas","Unwilling to move quickly"],
      pragmatist: ["Thorough","Dependable","Detail-focused","Risk-averse","Steady and reliable"],
    },
    perceives: {
      originator: ["Divisive","Impulsive","Starts but doesn't finish","Wants change for its own sake","Lacks appreciation for what works"],
      pragmatist: ["Indecisive","Too middle-of-the-road","Hiding behind team needs"],
    },
  },
  pragmatist: {
    color: "#3B6D11", light: "#EAF3DE", textColor: "#27500A",
    facing: ["Prefers change that emphasizes workable, practical outcomes","More focused on results than on preserving structure","Open to both sides of an argument","Operates as a mediator and catalyst on teams","May take a middle-of-the-road approach"],
    contributing: ["Gets things done in spite of rules, not just because of them","Negotiates and encourages cooperation to solve problems","Takes a realistic and practical approach to challenges","Draws people together around a common purpose","Organizes ideas into tangible action plans"],
    leading: ["Facilitates problem solving among diverse groups","Adapts past experiences effectively to solve current problems","Builds cooperation rather than simply expecting it","Uses a facilitative approach to manage projects","Encourages congruence between values and actions"],
    innovation: ["Brings new ideas into reality, making them tangible and concrete","Bridges long-range goals with short-term operational demands","Keeps others focused and moving toward the end goal"],
    collaborating: ["Serves as a bridge between diverse positions and opinions","Encourages building upon multiple perspectives","Focuses on achieving workable consensus"],
    perceivedBy: {
      conserver: ["Indecisive","Noncommittal","Easily influenced","Too compromising","Mediating"],
      originator: ["Indecisive","Noncommittal","Mediating","Compromising","Hiding behind team"],
    },
    perceives: {
      conserver: ["Reliable","Detail-oriented","Risk-averse","Methodical"],
      originator: ["Visionary","Energetic","Risk-taking","Impatient"],
    },
  },
  originator: {
    color: "#C8860A", light: "#FFF3D6", textColor: "#633806",
    facing: ["Prefers change that challenges and transforms current structure","Will challenge accepted assumptions and conventions","Enjoys risk and uncertainty as part of the process","May appear impractical and sometimes miss important details","Tends to be more future-oriented than past-oriented"],
    contributing: ["Pushes the organization to see and embrace the big picture","Provides future-oriented perspectives and possibilities","Supports and encourages risk-taking behavior","Promotes new ideas, projects, and activities","Enjoys complex, ambiguous problems and thinks conceptually"],
    leading: ["Serves as a catalyst for big, transformational change","Energetic and enthusiastic in driving change initiatives","Provides long-range vision and strategic perspective","Conceptualizes and designs new processes and systems","Prefers to lead the start-up and launch phases"],
    innovation: ["Not afraid to challenge the status quo and accepted thinking","Encourages exploration of new and alternative ideas","Presents possibilities that others do not imagine","Produces many divergent and creative ideas"],
    collaborating: ["Encourages out-of-the-box and unconventional thinking","Initiates enthusiasm and excitement around new possibilities","Focuses on initiating new tasks and directions"],
    perceivedBy: {
      conserver: ["Divisive","Impulsive","Starts but doesn't finish","Wants change for its own sake","Impractical"],
      pragmatist: ["Visionary","Bold","Impractical at times","Risk-seeking","Unconventional"],
    },
    perceives: {
      conserver: ["Stubborn","Bureaucratic","Lacking new ideas","Slow to move","Supporting status quo"],
      pragmatist: ["Indecisive","Noncommittal","Too middle-of-the-road","Easily swayed"],
    },
  },
}

export const TIPS = {
  general: [
    "Ask lots of questions and genuinely listen to the answers before acting.",
    "Consult with someone you believe has a style different from yours before making major decisions.",
    "Make deliberate efforts to understand the perspectives of styles other than your own.",
    "Step back and notice your initial emotional reaction in change situations — it can reveal when your response goes beyond the facts at hand.",
  ],
  conserver: [
    "Consider at least three alternatives before making or announcing a decision.",
    "Allow yourself time to reflect, but set a deadline to avoid analysis paralysis.",
    "Think actively about big-picture consequences — ask an Originator for their perspective.",
    "Develop strategies for exploring long-term consequences of change — think five years ahead.",
    "Write down the advantages of taking a more Originator-type approach before dismissing it.",
    "Avoid defaulting to committees for decision-making unless they are genuinely necessary.",
  ],
  pragmatist: [
    "Identify a strong Conserver and a strong Originator and actively solicit both their views.",
    "Ask Conservers 'Why is this important?' and Originators 'What's stopping you?'",
    "Specify a defined period of time to consider alternatives, then commit to a direction.",
    "Imagine the consequences of your decision in one, five, and ten years.",
    "Create a list of potential solutions, apply no more than five criteria, then prioritize.",
    "Be willing to let some stakeholders be less than fully satisfied with the outcome.",
  ],
  originator: [
    "Wait at least a day before taking action — your instinct to move fast can overlook critical details.",
    "Find someone you suspect is a Conserver and genuinely ask for their perspective.",
    "Identify and try to understand at least five concrete facts related to the situation.",
    "Explore three things that are currently working well before proposing to change everything.",
    "Set realistic priorities and time-lines — make a list, then rank and ruthlessly reduce it.",
    "Create a visual image of your desired outcome and return to it when details become difficult.",
    "Include implementation-focused people as early as possible — the real work is in the execution.",
    "Remember that the real challenge is not the idea but the implementation.",
  ],
}

export const WORKING_WITH = {
  conserver: {
    env: ["Steady and consistent pace is rewarded","Time and space for reflection","Stable, structured, orderly and predictable environment","Successes are acknowledged and rewarded","Clearly defined processes and expectations"],
    comms: ["Know the relevant details before approaching them","Don't lead with the big picture — build up from specifics","Pick one angle and develop it thoroughly","Present basic information first and ask what else they need","Ask about anticipated obstacles and potential risks upfront"],
  },
  pragmatist: {
    env: ["Flexible and adaptive structures","Hands-on experiences are encouraged","Harmonious and participative atmosphere","Constructive people focused on the situation at hand","Group-oriented problem solving is valued"],
    comms: ["Speak in terms of outcomes and practical results","Talk about consequences of continuing down the current path","Ask for recommendations on practical first steps","Discuss problems and barriers to implementation honestly","Talk about the consequences of taking too long to act"],
  },
  originator: {
    env: ["Low attention to routine detail","People working independently on challenging new problems","Change and risk-oriented culture","Unbureaucratic, unconstrained by excessive rules and policy","Focus on future planning and possibilities"],
    comms: ["Talk about the future — ask what they would like to see happen","Ask for their ideas openly and without judgment","Ask what is currently working that they would not want to see changed","Talk about the connection between the proposed change and future effectiveness","Ask about barriers to implementation and whose support is needed"],
  },
}

export const QUESTIONS = [
  ["I excel at coming up with new ideas.", "I excel at developing and improving existing ideas."],
  ["I find it hard to stay engaged with routine tasks.", "I stay focused and engaged through long, detailed tasks."],
  ["I pay close attention to details.", "I naturally focus on the big picture."],
  ["I place high value on original and creative thinking.", "I place high value on practical and proven approaches."],
  ["I prefer to follow established guidelines and procedures.", "I prefer to figure things out as the situation unfolds."],
  ["I enjoy experimenting with new and untested solutions.", "I prefer solutions that are tried, tested and practical."],
  ["I work best when focusing on one project at a time.", "I work best when juggling multiple projects at once."],
  ["I generate many ideas and am comfortable if some turn out to be unworkable.", "I focus on a smaller number of well-considered and proven ideas."],
  ["I believe policies should be regularly questioned and reviewed.", "I believe policies exist for good reason and should be respected."],
  ["I tend to encourage agreement and cohesion in groups.", "I tend to encourage open debate and diverse viewpoints in groups."],
  ["I feel most comfortable in familiar and predictable situations.", "I feel most energised by new and unpredictable situations."],
  ["I tend to complete projects in a flexible, non-linear way.", "I tend to complete projects in a structured, step-by-step way."],
  ["I prefer sticking to methods that have worked before.", "I prefer trying a fresh approach each time."],
  ["I prefer to pass a project on once the direction is clear.", "I prefer to stay involved and see a project through to completion."],
  ["I get more satisfaction from building something entirely new.", "I get more satisfaction from refining and enhancing what already exists."],
  ["I value tradition and the wisdom of established practices.", "I value change and the opportunities it brings."],
  ["I am drawn to emerging, cutting-edge challenges.", "I am drawn to immediate, practical, day-to-day challenges."],
  ["I make decisions grounded in data, evidence and facts.", "I make decisions guided by instinct and intuition."],
  ["I prefer detailed written instructions and documentation.", "I prefer visual, graphic or illustrated instructions."],
  ["I tend to think carefully before responding to situations.", "I tend to respond quickly and instinctively to situations."],
]

export const ITEM_MAP = [
  {a:"O",b:"C"},{a:"O",b:"C"},{a:"C",b:"O"},{a:"O",b:"C"},{a:"C",b:"O"},
  {a:"O",b:"C"},{a:"C",b:"O"},{a:"O",b:"C"},{a:"O",b:"C"},{a:"C",b:"O"},
  {a:"C",b:"O"},{a:"O",b:"C"},{a:"C",b:"O"},{a:"O",b:"C"},{a:"O",b:"C"},
  {a:"C",b:"O"},{a:"O",b:"C"},{a:"C",b:"O"},{a:"C",b:"O"},{a:"C",b:"O"},
]
