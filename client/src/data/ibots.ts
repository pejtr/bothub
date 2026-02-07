export interface IBot {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  nameCs: string;
  icon: string;
  description: string;
  color: string;
}

export const categories: Category[] = [
  { id: "sales", name: "Sales & Marketing", nameCs: "Prodej & Marketing", icon: "📈", description: "Agresivní prodejní techniky a marketingové strategie", color: "#F59E0B" },
  { id: "therapy", name: "Therapy & Psychology", nameCs: "Terapie & Psychologie", icon: "🧠", description: "Empatická komunikace a psychologické poradenství", color: "#8B5CF6" },
  { id: "leadership", name: "Leadership & Business", nameCs: "Leadership & Business", icon: "🏢", description: "Strategické vedení a byznysové rozhodování", color: "#3B82F6" },
  { id: "wealth", name: "Wealth & Investing", nameCs: "Bohatství & Investice", icon: "💰", description: "Finanční strategie a investiční poradenství", color: "#10B981" },
  { id: "spirituality", name: "Spirituality & Wisdom", nameCs: "Spiritualita & Moudrost", icon: "🕊️", description: "Duchovní rozvoj a životní moudrost", color: "#EC4899" },
  { id: "health", name: "Health & Biohacking", nameCs: "Zdraví & Biohacking", icon: "💪", description: "Optimalizace zdraví a výkonu", color: "#EF4444" },
  { id: "creativity", name: "Creativity & Productivity", nameCs: "Kreativita & Produktivita", icon: "🚀", description: "Kreativní myšlení a maximální produktivita", color: "#F97316" },
];

export const ibots: IBot[] = [
  // Sales & Marketing (11)
  { id: "hormozi", name: "Alex Hormozi", description: "Agresivní prodejní strategie, $100M Offers, Value Equation. Maximalizuje konverze a vytváří nabídky, které zákazník nemůže odmítnout.", category: "sales", tags: ["prodej", "konverze", "offers"], featured: true },
  { id: "cardone", name: "Grant Cardone", description: "10X pravidlo, agresivní follow-up, sales mastery. Učí vás prodávat s maximální energií.", category: "sales", tags: ["10X", "sales", "energie"] },
  { id: "brunson", name: "Russell Brunson", description: "Funnelový expert, StoryBrand, ClickFunnels. Staví prodejní funnely, které konvertují.", category: "sales", tags: ["funnely", "marketing", "storytelling"] },
  { id: "vaynerchuk", name: "Gary Vaynerchuk", description: "Social media marketing, osobní branding, hustle kultura.", category: "sales", tags: ["social media", "branding", "content"] },
  { id: "godin", name: "Seth Godin", description: "Permission marketing, Purple Cow, remarkabilní produkty.", category: "sales", tags: ["marketing", "inovace", "brand"] },
  { id: "cialdini", name: "Robert Cialdini", description: "6 principů přesvědčování, psychologie vlivu, persuasion.", category: "sales", tags: ["persuasion", "psychologie", "vliv"] },
  { id: "ogilvy", name: "David Ogilvy", description: "Otec reklamy, copywriting, brand building.", category: "sales", tags: ["reklama", "copywriting", "brand"] },
  { id: "halbert", name: "Gary Halbert", description: "Direct response marketing, sales letters, copywriting legendy.", category: "sales", tags: ["direct response", "copywriting", "sales letters"] },
  { id: "kennedy", name: "Dan Kennedy", description: "No B.S. marketing, direct response, magnetic marketing.", category: "sales", tags: ["direct response", "no BS", "marketing"] },
  { id: "belfort", name: "Jordan Belfort", description: "Straight Line Persuasion, sales closing, tonalita hlasu.", category: "sales", tags: ["closing", "persuasion", "tonalita"] },
  { id: "tracy", name: "Brian Tracy", description: "Psychologie prodeje, time management, goal setting.", category: "sales", tags: ["prodej", "time management", "cíle"] },

  // Therapy & Psychology (11)
  { id: "jung", name: "Carl Jung", description: "Analytická psychologie, archetypy, kolektivní nevědomí, individuace.", category: "therapy", tags: ["archetypy", "nevědomí", "individuace"] },
  { id: "frankl", name: "Viktor Frankl", description: "Logoterapie, hledání smyslu, existenciální psychologie.", category: "therapy", tags: ["smysl", "logoterapie", "existencialismus"] },
  { id: "brown", name: "Brené Brown", description: "Zranitelnost, odvaha, empatie, autenticita.", category: "therapy", tags: ["zranitelnost", "empatie", "odvaha"] },
  { id: "rogers", name: "Carl Rogers", description: "Humanistická psychologie, bezpodmínečné přijetí, klientsky orientovaná terapie.", category: "therapy", tags: ["humanismus", "přijetí", "terapie"] },
  { id: "peterson", name: "Jordan Peterson", description: "Klinická psychologie, zodpovědnost, řád a chaos.", category: "therapy", tags: ["zodpovědnost", "řád", "smysl"] },
  { id: "adler", name: "Alfred Adler", description: "Individuální psychologie, komplex méněcennosti, sociální zájem.", category: "therapy", tags: ["individualní psychologie", "sociální zájem"] },
  { id: "maslow", name: "Abraham Maslow", description: "Hierarchie potřeb, seberealizace, peak experiences.", category: "therapy", tags: ["potřeby", "seberealizace", "motivace"] },
  { id: "fromm", name: "Erich Fromm", description: "Umění milovat, svoboda, humanistická psychoanalýza.", category: "therapy", tags: ["láska", "svoboda", "humanismus"] },
  { id: "yalom", name: "Irvin Yalom", description: "Existenciální psychoterapie, skupinová terapie, smrt a smysl.", category: "therapy", tags: ["existencialismus", "skupina", "smrt"] },
  { id: "kabatzinn", name: "Jon Kabat-Zinn", description: "Mindfulness, MBSR, vědomá přítomnost, stres management.", category: "therapy", tags: ["mindfulness", "stres", "přítomnost"] },
  { id: "grof", name: "Stanislav Grof", description: "Transpersonální psychologie, holotropní dýchání, rozšířené stavy vědomí.", category: "therapy", tags: ["transpersonální", "vědomí", "dýchání"] },

  // Leadership & Business (11)
  { id: "musk", name: "Elon Musk", description: "First principles thinking, moonshot cíle, inovace za hranicemi možného.", category: "leadership", tags: ["inovace", "first principles", "vize"] },
  { id: "jobs", name: "Steve Jobs", description: "Design thinking, product excellence, reality distortion field.", category: "leadership", tags: ["design", "produkt", "vize"] },
  { id: "dalio", name: "Ray Dalio", description: "Principy, radikální transparentnost, meritokracie nápadů.", category: "leadership", tags: ["principy", "transparentnost", "rozhodování"] },
  { id: "bezos", name: "Jeff Bezos", description: "Customer obsession, Day 1 mentalita, dlouhodobé myšlení.", category: "leadership", tags: ["zákazník", "inovace", "škálování"] },
  { id: "buffett_l", name: "Charlie Munger", description: "Mentální modely, multidisciplinární myšlení, inverze.", category: "leadership", tags: ["mentální modely", "myšlení", "moudrost"] },
  { id: "drucker", name: "Peter Drucker", description: "Management, efektivita, knowledge worker, inovace.", category: "leadership", tags: ["management", "efektivita", "inovace"] },
  { id: "grove", name: "Andy Grove", description: "High Output Management, OKR, strategické inflexní body.", category: "leadership", tags: ["management", "OKR", "strategie"] },
  { id: "collins", name: "Jim Collins", description: "Good to Great, Level 5 Leadership, Flywheel Effect.", category: "leadership", tags: ["great companies", "leadership", "flywheel"] },
  { id: "sinek", name: "Simon Sinek", description: "Start With Why, Infinite Game, inspirativní leadership.", category: "leadership", tags: ["proč", "leadership", "inspirace"] },
  { id: "thiel", name: "Peter Thiel", description: "Zero to One, monopolní strategie, contrarian thinking.", category: "leadership", tags: ["startup", "monopol", "contrarian"] },
  { id: "welch", name: "Jack Welch", description: "GE transformace, talent management, candor.", category: "leadership", tags: ["transformace", "talent", "upřímnost"] },

  // Wealth & Investing (11)
  { id: "buffett", name: "Warren Buffett", description: "Value investing, compound interest, dlouhodobé investování.", category: "wealth", tags: ["value investing", "compound", "dlouhodobé"] },
  { id: "kiyosaki", name: "Robert Kiyosaki", description: "Rich Dad Poor Dad, finanční gramotnost, pasivní příjem.", category: "wealth", tags: ["finanční gramotnost", "pasivní příjem", "aktiva"] },
  { id: "naval", name: "Naval Ravikant", description: "Wealth creation, leverage, specific knowledge, judgement.", category: "wealth", tags: ["wealth", "leverage", "znalosti"] },
  { id: "graham", name: "Benjamin Graham", description: "Inteligentní investor, margin of safety, fundamentální analýza.", category: "wealth", tags: ["investování", "margin of safety", "analýza"] },
  { id: "marks", name: "Howard Marks", description: "Second-level thinking, cykly, risk management.", category: "wealth", tags: ["cykly", "risk", "myšlení"] },
  { id: "lynch", name: "Peter Lynch", description: "One Up on Wall Street, invest in what you know.", category: "wealth", tags: ["akcie", "znalosti", "růst"] },
  { id: "taleb", name: "Nassim Taleb", description: "Antifragilita, Black Swan, risk a nejistota.", category: "wealth", tags: ["antifragilita", "risk", "nejistota"] },
  { id: "ramsey", name: "Dave Ramsey", description: "Finanční mír, baby steps, debt-free living.", category: "wealth", tags: ["dluhy", "rozpočet", "finanční mír"] },
  { id: "templeton", name: "John Templeton", description: "Globální investování, contrarian, optimismus.", category: "wealth", tags: ["globální", "contrarian", "optimismus"] },
  { id: "soros", name: "George Soros", description: "Reflexivita, makro investování, spekulace.", category: "wealth", tags: ["makro", "reflexivita", "spekulace"] },
  { id: "klarman", name: "Seth Klarman", description: "Margin of Safety, value investing, trpělivost.", category: "wealth", tags: ["value", "trpělivost", "margin of safety"] },

  // Spirituality & Wisdom (11)
  { id: "dalailama", name: "Dalai Lama", description: "Soucit, vnitřní mír, buddhismus, mezilidské vztahy.", category: "spirituality", tags: ["soucit", "mír", "buddhismus"] },
  { id: "tolle", name: "Eckhart Tolle", description: "Moc přítomného okamžiku, ego, probuzení, vědomí.", category: "spirituality", tags: ["přítomnost", "ego", "vědomí"] },
  { id: "sharma", name: "Robin Sharma", description: "5 AM Club, Mnich který prodal své Ferrari, leadership a osobní rozvoj.", category: "spirituality", tags: ["ranní rutina", "leadership", "osobní rozvoj"] },
  { id: "chopra", name: "Deepak Chopra", description: "Kvantové léčení, meditace, vědomí a zdraví.", category: "spirituality", tags: ["meditace", "vědomí", "zdraví"] },
  { id: "watts", name: "Alan Watts", description: "Zen buddhismus, taoismus, západní filozofie východu.", category: "spirituality", tags: ["zen", "taoismus", "filozofie"] },
  { id: "aurelius", name: "Marcus Aurelius", description: "Stoicismus, Meditace, vnitřní klid, povinnost.", category: "spirituality", tags: ["stoicismus", "klid", "povinnost"] },
  { id: "rumi", name: "Rumi", description: "Súfismus, láska, poezie, duchovní transformace.", category: "spirituality", tags: ["láska", "poezie", "transformace"] },
  { id: "thich", name: "Thich Nhat Hanh", description: "Mindfulness, engaged buddhismus, mír, přítomnost.", category: "spirituality", tags: ["mindfulness", "mír", "přítomnost"] },
  { id: "coelho", name: "Paulo Coelho", description: "Alchymista, osobní legenda, následování srdce.", category: "spirituality", tags: ["legenda", "srdce", "cesta"] },
  { id: "seneca", name: "Seneca", description: "Stoická filozofie, krátkost života, klid mysli.", category: "spirituality", tags: ["stoicismus", "čas", "klid"] },
  { id: "osho", name: "Osho", description: "Meditace, svoboda, nekonvenční duchovní učení.", category: "spirituality", tags: ["meditace", "svoboda", "nekonvenční"] },

  // Health & Biohacking (11)
  { id: "huberman", name: "Andrew Huberman", description: "Neurověda, optimalizace spánku, dopamin, protokoly.", category: "health", tags: ["neurověda", "spánek", "protokoly"] },
  { id: "attia", name: "Peter Attia", description: "Longevity, metabolické zdraví, preventivní medicína.", category: "health", tags: ["longevity", "metabolismus", "prevence"] },
  { id: "hof", name: "Wim Hof", description: "Ledová terapie, dechové techniky, odolnost.", category: "health", tags: ["chlad", "dech", "odolnost"] },
  { id: "asprey", name: "Dave Asprey", description: "Bulletproof, biohacking, optimalizace výkonu.", category: "health", tags: ["biohacking", "výkon", "bulletproof"] },
  { id: "sinclair", name: "David Sinclair", description: "Anti-aging, sirtuiny, NAD+, longevity výzkum.", category: "health", tags: ["anti-aging", "sirtuiny", "longevity"] },
  { id: "walker", name: "Matthew Walker", description: "Spánek, Why We Sleep, spánková hygiena.", category: "health", tags: ["spánek", "hygiena", "zdraví"] },
  { id: "rhonda", name: "Rhonda Patrick", description: "Nutrigenomika, sauna, mikronutrienty.", category: "health", tags: ["nutrigenomika", "sauna", "výživa"] },
  { id: "greger", name: "Michael Greger", description: "How Not to Die, plant-based výživa, prevence.", category: "health", tags: ["výživa", "prevence", "rostlinná strava"] },
  { id: "perlmutter", name: "David Perlmutter", description: "Grain Brain, střevní mikrobiom, mozek a strava.", category: "health", tags: ["mozek", "mikrobiom", "strava"] },
  { id: "fung", name: "Jason Fung", description: "Intermittent fasting, inzulínová rezistence, metabolismus.", category: "health", tags: ["fasting", "inzulín", "metabolismus"] },
  { id: "mercola", name: "Joseph Mercola", description: "Alternativní medicína, mitochondrie, metabolické zdraví.", category: "health", tags: ["alternativní", "mitochondrie", "zdraví"] },

  // Creativity & Productivity (11)
  { id: "goggins", name: "David Goggins", description: "Mentální tvrdost, 40% pravidlo, překonávání limitů.", category: "creativity", tags: ["tvrdost", "limity", "disciplína"] },
  { id: "holiday", name: "Ryan Holiday", description: "Stoicismus v praxi, Obstacle is the Way, Daily Stoic.", category: "creativity", tags: ["stoicismus", "překážky", "disciplína"] },
  { id: "ferriss", name: "Tim Ferriss", description: "4-Hour Work Week, lifestyle design, experimenty.", category: "creativity", tags: ["produktivita", "lifestyle", "experimenty"] },
  { id: "newport", name: "Cal Newport", description: "Deep Work, Digital Minimalism, soustředěná práce.", category: "creativity", tags: ["deep work", "soustředění", "minimalismus"] },
  { id: "clear", name: "James Clear", description: "Atomic Habits, systémy vs cíle, 1% zlepšení.", category: "creativity", tags: ["návyky", "systémy", "zlepšení"] },
  { id: "pressfield", name: "Steven Pressfield", description: "War of Art, Resistance, profesionální přístup.", category: "creativity", tags: ["odpor", "kreativita", "profesionalismus"] },
  { id: "csikszentmihalyi", name: "Mihaly Csikszentmihalyi", description: "Flow, optimální prožitek, kreativita.", category: "creativity", tags: ["flow", "prožitek", "kreativita"] },
  { id: "allen", name: "David Allen", description: "Getting Things Done, organizace, stress-free produktivita.", category: "creativity", tags: ["GTD", "organizace", "produktivita"] },
  { id: "covey", name: "Stephen Covey", description: "7 návyků, proaktivita, principy efektivity.", category: "creativity", tags: ["návyky", "proaktivita", "efektivita"] },
  { id: "duckworth", name: "Angela Duckworth", description: "Grit, vytrvalost, vášeň a dlouhodobé cíle.", category: "creativity", tags: ["grit", "vytrvalost", "vášeň"] },
  { id: "kahneman", name: "Daniel Kahneman", description: "Thinking Fast and Slow, kognitivní zkreslení, rozhodování.", category: "creativity", tags: ["myšlení", "zkreslení", "rozhodování"] },
];

export function getIBotsByCategory(categoryId: string): IBot[] {
  return ibots.filter(bot => bot.category === categoryId);
}

export function getFeaturedIBot(): IBot | undefined {
  return ibots.find(bot => bot.featured);
}
