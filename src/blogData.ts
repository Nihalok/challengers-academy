import { ASSETS } from './assets/images';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  authorRole: string;
  image: string;
  excerpt: string;
  content: string[];
  keyTakeaways: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'how-to-improve-your-jump-float',
    slug: 'how-to-improve-your-jump-float',
    title: 'How to Improve Your Jump Float',
    category: 'Technical',
    date: 'Oct 12, 2024',
    readTime: '4 min read',
    author: 'Head Coach Wilson Mathew',
    authorRole: 'Founder & FIVB Certified Coach',
    image: ASSETS.EXPERTISE.FOUNDATIONAL,
    excerpt: 'Mastering the physics of the no-spin float serve to disrupt passer rhythm and rack up aces from the baseline.',
    content: [
      'The jump float serve is widely considered the most unpredictable and lethal weapon in modern competitive volleyball. Unlike a topspin jump serve that drops along a predictable parabolic arc, a properly struck float serve knuckles through the air, shifting abruptly due to laminar air flow detachment.',
      'To achieve maximum float, the secret lies entirely in your contact point and deceleration. You must strike the direct center of the ball with a rock-firm, open palm and immediately stop your follow-through—treating the contact like hitting a brick wall.',
      'Toss consistency is the cornerstone of great serving. Toss with one hand roughly 2 to 3 feet in front of your hitting shoulder and only 3 to 4 feet into the air. If your toss is too high, timing variations will introduce unwanted rotation to the ball.',
      'During your 3-step approach (Left-Right-Left for right-handed hitters), maintain an upright core. As you leave the floor, keep your elbow high and back, meeting the ball at peak vertical reach with a flat, rigid wrist.',
      'Target the deep seams between passers (zones 1-6 and 5-6) or aim directly at the receiver’s chest height where passing platforms are most vulnerable. Practice 50 deliberate repetitions per session focusing on zero-spin ball travel.'
    ],
    keyTakeaways: [
      'Firm, flat palm contact directly in the ball center with zero wrist snap',
      'Immediate contact deceleration (no follow-through) to generate turbulent knuckle flight',
      'Low, consistent 3-foot toss keeping the ball directly in front of the hitting shoulder',
      'Target deep seam zones between passers to force split-second communication hesitation'
    ]
  },
  {
    id: 'what-to-eat-before-a-game',
    slug: 'what-to-eat-before-a-game',
    title: 'What to Eat Before a Game',
    category: 'Fitness',
    date: 'Oct 08, 2024',
    readTime: '5 min read',
    author: 'Coach Wilson & Training Staff',
    authorRole: 'Academy Athletic Development',
    image: ASSETS.EXPERTISE.ELITE,
    excerpt: 'A complete nutritional timing guide to sustain explosive vertical power and mental alertness throughout multi-set matches.',
    content: [
      'Volleyball is a high-intensity sport demanding continuous explosive vertical jumps, sudden changes of direction, and rapid cognitive decision-making. Fueling your body correctly before hitting the hardwood determines whether you maintain sharpness in set five or burn out early.',
      '3 to 4 hours before match time, eat a balanced meal composed of complex carbohydrates, lean protein, and moderate healthy fats. Great options include grilled chicken with brown rice and steamed veggies, oatmeal with banana and honey, or a turkey breast wrap on whole wheat.',
      'Avoid high-fat or overly greasy foods close to match time, as fat takes significantly longer to digest and diverts blood flow away from active skeletal muscle to the stomach, causing sluggishness and cramping.',
      '60 to 90 minutes before warmup, top off glycogen stores with easily digestible, low-fiber fast carbohydrates like a ripe banana, applesauce, a handful of pretzels, or a light energy bar with minimal protein.',
      'Hydration starts 24 hours before game day. Drink 16 to 20 ounces of water 2 hours prior to the match, and sip electrolyte-infused fluids during timeouts to replace sodium and potassium lost through sweat on indoor gym courts.'
    ],
    keyTakeaways: [
      'Eat a complex carb + lean protein meal 3 to 4 hours before first whistle',
      'Consume easily digestible fast carbs (banana, pretzels) 60-90 minutes prior',
      'Avoid fried, high-fat, or heavy dairy foods on match day to prevent lethargy',
      'Pre-hydrate with electrolyte-balanced water 24 hours in advance'
    ]
  },
  {
    id: 'staying-calm-when-youre-down-by-two-sets',
    slug: 'staying-calm-when-youre-down-by-two-sets',
    title: "Staying Calm When You're Down by Two Sets",
    category: 'Mental Game',
    date: 'Sep 28, 2024',
    readTime: '6 min read',
    author: 'Head Coach Wilson Mathew',
    authorRole: 'Founder & FIVB Certified Coach',
    image: ASSETS.EXPERTISE.TACTICAL,
    excerpt: 'How elite volleyball players reset their psychological momentum, silence crowd pressure, and mount championship comebacks.',
    content: [
      'In a best-of-five match, falling behind 0-2 feels daunting. However, volleyball is a momentum-based sport where every set is a clean slate starting at 0-0. Championship teams are defined not by easy wins, but by their poise when facing match point against them.',
      'The first step to a reverse sweep is compartmentalization. When set two ends, consciously leave the previous points behind. Focus exclusively on the immediate first five points of set three to seize early psychological control.',
      'Establish a 3-second physical reset ritual between rallies: take a slow diaphragmatic breath, touch hands with your teammates in the center court huddle, and vocalize your assignment out loud (e.g., "Middle open, watch the tip!").',
      'Body language dictates confidence. Dropping your head or looking at the scoreboard sends subtle surrender signals to your opponent. Stand tall with your shoulders back, make direct eye contact with your setter, and celebrate every small hustle touch.',
      'Simplify your tactical execution: emphasize high-percentage serves in play, pass to the center of the court rather than forcing pin-point perfection, and swing high off the opponent block hands to generate tool points.'
    ],
    keyTakeaways: [
      'Compartmentalize the scoreboard — focus exclusively on the next 3 points',
      'Use structured between-point reset rituals and deep diaphragmatic breathing',
      'Maintain upright, aggressive body language to project unbreakable confidence',
      'Simplify court tactics: high-percentage serves and aggressive tool swings'
    ]
  },
  {
    id: 'court-shoes-and-safety',
    slug: 'court-shoes-and-safety',
    title: 'The Essential Guide to Court Shoes & Ankle Stability',
    category: 'Gear & Safety',
    date: 'Sep 15, 2024',
    readTime: '4 min read',
    author: 'Challengers Coaching Staff',
    authorRole: 'Safety & Equipment Directors',
    image: ASSETS.HERO.ACTION_CARD_4,
    excerpt: 'Why non-marking court grip, lateral cushioning, and proper ankle stability prevent injuries on hardwood gym floors.',
    content: [
      'Volleyball players subject their joints to thousands of high-impact landings and lateral cuts every single month. Wearing improper footwear, like running shoes or casual sneakers, is the single greatest preventable risk factor for rolled ankles and shin splints.',
      'True volleyball court shoes utilize natural gum rubber outsoles engineered specifically for varnished hardwood surfaces. This provides instant bite on the floor without leaving scuff marks or slipping when dust accumulates.',
      'Unlike running shoes designed only for forward propulsion with thick foam heels, volleyball shoes feature a low center of gravity with reinforced lateral outriggers to prevent ankle rollover during aggressive blocking transitions.',
      'Rotate your court shoes every 4 to 6 months of competitive play, as internal forefoot cushioning breaks down long before exterior tread looks visibly worn.',
      'Pair quality court shoes with supportive volleyball socks and active ankle braces if you have a history of inversion sprains.'
    ],
    keyTakeaways: [
      'Always wear dedicated gum rubber court shoes with non-marking soles',
      'Prioritize lateral support outriggers and forefoot cushioning over heel stack',
      'Never wear running shoes on court — their narrow base increases rollover risks',
      'Replace court footwear every 4-6 months to maintain vital joint protection'
    ]
  },
  {
    id: 'setter-decision-making',
    slug: 'setter-decision-making',
    title: 'Reading the Block: Setting Tactics for High Schoolers',
    category: 'Tactical',
    date: 'Aug 30, 2024',
    readTime: '5 min read',
    author: 'Head Coach Wilson Mathew',
    authorRole: 'Founder & FIVB Certified Coach',
    image: ASSETS.HERO.ACTION_CARD_2,
    excerpt: 'How setters can scan opponent middle blockers in transition and run fast-tempo offense even on out-of-system balls.',
    content: [
      'The setter is the undisputed quarterback of the volleyball court. Exceptional setters do not just deliver clean, hittable sets—they manipulate the opponent block to create single-blocker or open-net hitting lanes for their attackers.',
      'Pre-snap reads begin before the serve: identify where the opponent middle blocker is leaning, observe their weaker lateral transition direction, and note the opposing front row height matchups.',
      'Maintain neutral body posture on every single contact. If you arch your back early when back-setting, the opponent middle blocker will jump right before you even release the ball. Keep your hips square to the left pin until micro-seconds before release.',
      'On out-of-system passes pushed off the net, prioritize height and location over speed. Give your outside hitter a high, reachable ball inside the antenna that allows them to make an aggressive approach and swing off hands.'
    ],
    keyTakeaways: [
      'Scan opponent block positioning and middle blocker tendencies before each serve',
      'Maintain identical body posture on forward sets, back sets, and middle quicks',
      'Isolate your hottest attacker against the opponent’s shortest front-row blocker',
      'On out-of-system balls, prioritize height and depth so hitters can approach cleanly'
    ]
  },
  {
    id: 'youth-tryout-checklist',
    slug: 'youth-tryout-checklist',
    title: 'How to Stand Out at Academy and School Tryouts',
    category: 'Tryout Prep',
    date: 'Aug 14, 2024',
    readTime: '4 min read',
    author: 'Head Coach Wilson Mathew',
    authorRole: 'Founder & FIVB Certified Coach',
    image: ASSETS.HERO.ACTION_CARD_1,
    excerpt: 'Coaches share the non-negotiables they look for: hustle on defense, court communication, and coachability under pressure.',
    content: [
      'Tryouts can be stressful for young athletes, but understanding what evaluators genuinely look for will give you an immediate edge over the competition.',
      'Skill and athleticism matter, but coachability and court energy matter even more. Coaches want players who sprint to shag volleyballs, look coaches in the eye during huddles, and immediately apply technical corrections.',
      'Vocal leadership separates good players from indispensable roster members. Call the ball loudly ("MINE! MINE!") on every touch, communicate seam responsibilities before the serve, and encourage teammates after missed points.',
      'Never give up on a play. Diving for a shanked ball or chasing an errant pass into the bleachers demonstrates relentless competitive grit that coaches cannot teach.'
    ],
    keyTakeaways: [
      'Be the loudest, most vocal communicator on the gym floor',
      'Sprint between drills, shag aggressively, and listen attentively in huddles',
      'Demonstrate immediate coachability by implementing feedback on the next rep',
      'Show positive resilience and lift up teammates after errors'
    ]
  }
];
