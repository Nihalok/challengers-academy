import { Program, Location, Stat, Testimonial, Camp } from './types';
import { ASSETS } from './assets/images';

export const PROGRAMS: Program[] = [
  {
    id: 'little-spikers',
    title: 'Little Spikers',
    description: 'Introduction to volleyball for the youngest athletes.',
    longDescription: 'Little Spikers is for kids who are brand new to the sport. We keep it fun, age-appropriate, and focused on the basics - how to move, how to hit, and how to work as a team. No prior experience needed.',
    image: ASSETS.EXPERTISE.FOUNDATIONAL,
    ageRange: '5 - 10',
    ageGroups: ['5-10'],
    features: ['Motor Skills', 'Fun Drills', 'Basic Rules', 'Team Play']
  },
  {
    id: 'youth-foundations',
    title: 'Youth Foundations',
    description: 'Building technical precision and core mechanics.',
    longDescription: 'This group is for middle-school players who already know the basics and want to get sharper. We work on cleaner passing, better serving, and how to run simple plays - so players are ready for school or club tryouts.',
    image: ASSETS.EXPERTISE.TACTICAL,
    ageRange: '11 - 14',
    ageGroups: ['11-14'],
    features: ['Technical Precision', 'Serving Power', 'Basic Rotations', 'Tryout Prep']
  },
  {
    id: 'high-school-prep',
    title: 'High School Prep',
    description: 'Advanced tactical systems and elite performance.',
    longDescription: 'For high school players who are serious about the game. We go deep on offensive and defensive systems, position-specific skills, and the mindset needed to compete at the varsity level. College-prep support is included for those who want it.',
    image: ASSETS.EXPERTISE.ELITE,
    ageRange: '15 - 18',
    ageGroups: ['15-18'],
    features: ['Positional IQ', 'Advanced Systems', 'Mental Game', 'College Prep']
  },
  {
    id: 'all-ages-clinics',
    title: 'Open Skills Clinics',
    description: 'Targeted skill development for all experience levels.',
    longDescription: 'These open sessions focus on one skill at a time - setting, hitting, passing, or serving. Open to all ages. We group players by what they can actually do, not how old they are, so no one is out of place.',
    image: ASSETS.JOURNEY.STEP_1,
    ageRange: '5 - 18',
    ageGroups: ['5-10', '11-14', '15-18'],
    features: ['Targeted Skills', 'Level Grouping', 'High Reps', 'Expert Feedback']
  },
  {
    id: 'competitive-league',
    title: 'Junior Academy League',
    description: 'Internal league play for real-game experience.',
    longDescription: 'This is our in-house league for players who want real match experience. Games are held within the academy so you get all the excitement of competition without the travel. Great for building confidence and learning how to play under pressure.',
    image: ASSETS.JOURNEY.STEP_2,
    ageRange: '11 - 18',
    ageGroups: ['11-14', '15-18'],
    features: ['Game Strategy', 'Team Dynamics', 'Internal Playoffs', 'Certified Refs']
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
    id: 'fremont',
    name: 'Fremont - Hansen Elementary / Kerala House',
    address: '4037 Fremont Blvd',
    city: 'Fremont',
    zip: '94538',
    coords: { lat: 37.5342, lng: -121.9682 },
    description: 'Hansen Elementary & Kerala House facility in Fremont. Indoor court space for fundamental and advanced volleyball training.'
  },
  {
    id: 'manteca',
    name: 'Manteca - Courtside Sports',
    address: '450 Commerce Ct',
    city: 'Manteca',
    zip: '95336',
    coords: { lat: 37.7972, lng: -121.2161 },
    description: 'Courtside Sports facility in Manteca. High quality courts equipped for team drills, skills development, and game play.'
  },
  {
    id: 'mountain-house',
    name: 'Mountain House',
    address: 'Mountain House Training Center',
    city: 'Mountain House',
    zip: '95391',
    coords: { lat: 37.7846, lng: -121.5438 },
    description: 'Dedicated volleyball coaching and skill-building sessions for athletes in Mountain House.'
  },
  {
    id: 'san-jose',
    name: 'San Jose',
    address: 'San Jose Training Center',
    city: 'San Jose',
    zip: '95112',
    coords: { lat: 37.3382, lng: -121.8863 },
    description: 'Convenient training location serving young athletes and competitive players in San Jose.'
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
