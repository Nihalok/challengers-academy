import { Program, Location, Stat, Testimonial, Camp } from './types';
import { ASSETS } from './assets/images';

export const PROGRAMS: Program[] = [
  {
    id: 'tryout-session',
    title: 'Tryout Session (Court Evaluation)',
    description: 'Court evaluation to assess skill level, agility, and place athlete in the optimal academy group.',
    longDescription: 'Our 2-hour court evaluation gives new players a complete skill assessment. Coaches evaluate passing, serving, setting, and court awareness to assign players to their ideal training group.',
    image: ASSETS.HERO.ACTION_CARD_4,
    ageRange: '5 - 18',
    ageGroups: ['5-10', '11-14', '15-18'],
    features: ['1 Court Evaluation ($30)', '2-Hour Session', 'Individual / Group', 'Roster Recommendation']
  },
  {
    id: 'gym-training-1hr',
    title: 'Gym Training (4 Sessions – 1 Hour)',
    description: 'Indoor gym training covering foundational volleyball mechanics and passing precision.',
    longDescription: 'Indoor gym training with 4 focused 1-hour sessions covering volleyball mechanics, passing precision, agility, and fundamental drill repetitions.',
    image: ASSETS.EXPERTISE.FOUNDATIONAL,
    ageRange: '5 - 18',
    ageGroups: ['5-10', '11-14', '15-18'],
    features: ['4 x 1-Hour Sessions ($100)', 'Group Format', 'Indoor Gym Facility', 'Skill Progression']
  },
  {
    id: 'gym-training-4',
    title: 'Gym Training (4 Sessions – 2 Hours)',
    description: 'Core indoor academy training with structured drills, rotations, and scrimmages.',
    longDescription: 'Comprehensive 4-session indoor program focusing on fundamentals, ball control, positional awareness, rotations, and competitive scrimmage play in a professional gym facility.',
    image: ASSETS.HERO.ACTION_CARD_1,
    ageRange: '5 - 18',
    ageGroups: ['5-10', '11-14', '15-18'],
    features: ['4 x 2-Hour Sessions ($200)', 'Indoor Gym Facility', 'Rotations & Tactics', 'Scrimmage Play']
  },
  {
    id: 'gym-training-12',
    title: 'Gym Training (12 Sessions – Best Value)',
    description: 'Comprehensive 12-session indoor program for accelerated player development.',
    longDescription: 'Our flagship 12-session intensive program designed for maximum skill growth. Players master advanced footwork, attack timing, tactical rotations, and match execution.',
    image: ASSETS.HERO.ACTION_CARD_2,
    ageRange: '5 - 18',
    ageGroups: ['5-10', '11-14', '15-18'],
    features: ['12 x 2-Hour Sessions ($550)', 'Save $50 vs 4-Pack', 'Position Specialization', 'School & Club Prep']
  },
  {
    id: 'open-park-group',
    title: 'Open Park – Group Training',
    description: 'High-repetition outdoor group training building agility, ball control, and match readiness.',
    longDescription: 'High-repetition group training sessions in an open park atmosphere building stamina, passing control, and team communication with up to 12 students.',
    image: ASSETS.HERO.ACTION_CARD_3,
    ageRange: '5 - 18',
    ageGroups: ['5-10', '11-14', '15-18'],
    features: ['4 x 2-Hour Sessions ($150)', 'Outdoor Park Court', '12 Members Max', 'High Rep Drills']
  },
  {
    id: 'open-park-travel',
    title: 'Private Coaching – Open Park (Short Distance)',
    description: 'Personalized 1-on-1 coaching with coach travel to your local designated park court.',
    longDescription: 'Personalized 1-on-1 private coaching with the convenience of coach travel to a designated park court near you. Customized drill progression for individual growth.',
    image: ASSETS.EXPERTISE.ELITE,
    ageRange: '5 - 18',
    ageGroups: ['5-10', '11-14', '15-18'],
    features: ['4 Private Sessions ($320)', '1-on-1 Dedicated Coach', 'Coach Travels Near You', 'Custom Mechanics']
  },
  {
    id: 'open-park-private',
    title: 'Private Coaching – Open Park (Long Distance)',
    description: 'Dedicated 1-on-1 private coaching tailored entirely to your personal mechanics with extended travel.',
    longDescription: 'Dedicated 1-on-1 private coaching sessions with coach traveling to your preferred location, focusing intensively on player mechanics, hitting power, and match readiness.',
    image: ASSETS.EXPERTISE.TACTICAL,
    ageRange: '5 - 18',
    ageGroups: ['5-10', '11-14', '15-18'],
    features: ['4 x 2-Hour Sessions ($360)', '1-on-1 Dedicated Coach', 'Extended Travel Service', 'Rapid Progression']
  }
];

export const PERFORMANCE_DATA = [
  { month: 'Jan', vertical: 24, speed: 65, accuracy: 40, milestones: 2 },
  { month: 'Feb', vertical: 25, speed: 68, accuracy: 45, milestones: 3 },
  { month: 'Mar', vertical: 25.5, speed: 72, accuracy: 55, milestones: 5 },
  { month: 'Apr', vertical: 26.5, speed: 70, accuracy: 65, milestones: 8 },
  { month: 'May', vertical: 28, speed: 75, accuracy: 70, milestones: 10 },
  { month: 'Jun', vertical: 29.5, speed: 80, accuracy: 85, milestones: 14 },
];

export const AGE_GROUP_BENCHMARKS = [
  { category: '5-10', vertical: 18, speed: 55, accuracy: 45, milestones: 6 },
  { category: '11-14', vertical: 24, speed: 70, accuracy: 65, milestones: 10 },
  { category: '15-18', vertical: 32, speed: 90, accuracy: 85, milestones: 15 },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "Middle Blocker, U17 Elite",
    content: "I was honestly surprised by how much I improved in just a few months. My jump got better, my reading of the game got better, and I actually started enjoying practice more.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&h=200&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Marcus Chen",
    role: "Setter, Varsity Captain",
    content: "Head Coach Wilson doesn't just tell you what to do - he breaks down exactly why. That made a big difference for me as a setter. I finally understood the game, not just the plays.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&h=200&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    role: "Libero, Regional MVP",
    content: "I've been to other programs and this one feels different. Everyone knows each other, the coaches actually care, and you can see yourself getting better week after week.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop"
  }
];

export const LOCATIONS: Location[] = [
  {
    id: 'mountain-house',
    name: 'Hansen Elementary - Mountain House',
    address: '400 S. Duran Terrace',
    city: 'Mountain House',
    zip: '95391',
    coords: { lat: 37.7846, lng: -121.5438 },
    schedule: 'Saturdays | 9:00 am - 11:00 am',
    description: 'Hansen Elementary School facility in Mountain House. Saturday morning sessions for fundamental and advanced volleyball training.'
  },
  {
    id: 'fremont',
    name: 'Kerala House - Fremont',
    address: '4037 Fremont Blvd',
    city: 'Fremont',
    zip: '94538',
    coords: { lat: 37.5342, lng: -121.9682 },
    schedule: 'Sundays | 6:30 pm - 8:30 pm',
    description: 'Kerala House facility in Fremont. Sunday evening sessions covering fundamentals and advanced volleyball training.'
  },
  {
    id: 'manteca',
    name: 'Courtside Sports - Manteca',
    address: '450 Commerce CT',
    city: 'Manteca',
    zip: '95336',
    coords: { lat: 37.7972, lng: -121.2161 },
    schedule: 'Fridays | 5:00 pm - 7:00 pm',
    description: 'Courtside Sports facility in Manteca. Friday evening sessions - high quality courts for team drills, skills development, and game play.'
  },
  {
    id: 'san-jose',
    name: 'San Jose',
    address: 'Coming Soon',
    city: 'San Jose',
    zip: '95112',
    coords: { lat: 37.3382, lng: -121.8863 },
    schedule: 'Starting September - details coming soon',
    description: 'New training location launching September 2026. Serving young athletes and competitive players in San Jose.'
  }
];

export const STATS: Stat[] = [
  { label: 'Years Coaching', value: 35, suffix: '+' },
  { label: 'Athletes Trained', value: 5000, suffix: '+' },
  { label: 'Program Locations', value: 4 },
  { label: 'Success Rate', value: 98, suffix: '%' }
];

export const performanceStats = {
  '5-10': {
    skills: [
      { label: 'Passing Accuracy', value: 70 },
      { label: 'Serving Power', value: 50 },
      { label: 'Court Positioning', value: 65 },
      { label: 'Attack Efficiency', value: 48 }
    ],
    athletic: [
      { label: 'Vertical Jump', value: 18 },
      { label: 'Pro-Agility Shuttle', value: 65 },
      { label: 'Approach Reach', value: 55 },
      { label: 'Medicine Ball Toss', value: 48 }
    ],
    history: [
      { month: 'Jan', value: 50 },
      { month: 'Feb', value: 54 },
      { month: 'Mar', value: 58 },
      { month: 'Apr', value: 60 },
      { month: 'May', value: 64 },
      { month: 'Jun', value: 68 }
    ]
  },
  '11-14': {
    skills: [
      { label: 'Passing Accuracy', value: 82 },
      { label: 'Serving Power', value: 65 },
      { label: 'Court Positioning', value: 78 },
      { label: 'Attack Efficiency', value: 60 }
    ],
    athletic: [
      { label: 'Vertical Jump', value: 24 },
      { label: 'Pro-Agility Shuttle', value: 85 },
      { label: 'Approach Reach', value: 70 },
      { label: 'Medicine Ball Toss', value: 62 }
    ],
    history: [
      { month: 'Jan', value: 65 },
      { month: 'Feb', value: 68 },
      { month: 'Mar', value: 72 },
      { month: 'Apr', value: 70 },
      { month: 'May', value: 75 },
      { month: 'Jun', value: 80 }
    ]
  },
  '15-18': {
    skills: [
      { label: 'Passing Accuracy', value: 88 },
      { label: 'Serving Power', value: 82 },
      { label: 'Court Positioning', value: 85 },
      { label: 'Attack Efficiency', value: 75 }
    ],
    athletic: [
      { label: 'Vertical Jump', value: 32 },
      { label: 'Pro-Agility Shuttle', value: 92 },
      { label: 'Approach Reach', value: 88 },
      { label: 'Medicine Ball Toss', value: 78 }
    ],
    history: [
      { month: 'Jan', value: 78 },
      { month: 'Feb', value: 80 },
      { month: 'Mar', value: 85 },
      { month: 'Apr', value: 82 },
      { month: 'May', value: 88 },
      { month: 'Jun', value: 92 }
    ]
  }
};
