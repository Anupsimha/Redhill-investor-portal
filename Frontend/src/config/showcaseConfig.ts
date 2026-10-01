/**
 * Redhill Infra Showcase & Explorer Configuration
 * 
 * Customize your social media handles, hero taglines, brand highlights,
 * and featured projects here.
 */

export interface SocialLink {
  name: string;
  url: string;
  icon: 'youtube' | 'linkedin' | 'instagram' | 'facebook' | 'twitter';
  ariaLabel: string;
  handle: string;
}

export interface ShowcaseProject {
  id: string;
  name: string;
  category: 'villas' | 'highrise' | 'township' | 'commercial';
  location: string;
  badge: 'New Launch' | 'Under Construction' | 'Pre-Launch' | 'Exclusive Edition';
  rating: string;
  image: string;
  priceStarting: string;
  configuration: string;
  possessionDate: string;
  carpetArea: string;
  description: string;
  highlights: string[];
}

export const SHOWCASE_CONFIG = {
  // Brand Info
  brand: {
    name: 'Redhill Infra',
    taglineBadge: 'REDHILL PREMIER 2026 COLLECTION',
  },

  // Hero Section
  hero: {
    headlinePrefix: 'Nothing Like',
    headlineMain: "You've Seen Before.",
    subheadline: 'Crafting landmark architectural marvels, integrated luxury townships, and sustainable smart living across Bangalore’s prime growth corridors.',
    ctaExploreText: 'Explore Featured Projects',
    ctaSiteVisitText: 'Book VIP Site Visit',
    backgroundImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=2070',
  },

  // Social Media Handles - Update your links here
  socialMediaHandles: [
    {
      name: 'YouTube',
      url: 'https://youtube.com/@redhillinfra',
      icon: 'youtube',
      ariaLabel: 'Subscribe on YouTube',
      handle: '@redhillinfra',
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/company/redhillinfra',
      icon: 'linkedin',
      ariaLabel: 'Follow on LinkedIn',
      handle: 'Redhill Infrastructure Pvt Ltd',
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/redhillinfra',
      icon: 'instagram',
      ariaLabel: 'Follow on Instagram',
      handle: '@redhillinfra',
    },
    {
      name: 'Facebook',
      url: 'https://facebook.com/redhillinfra',
      icon: 'facebook',
      ariaLabel: 'Like on Facebook',
      handle: 'Redhill Infra Official',
    },
    {
      name: 'X (Twitter)',
      url: 'https://x.com/redhillinfra',
      icon: 'twitter',
      ariaLabel: 'Follow on X',
      handle: '@redhillinfra',
    },
  ] as SocialLink[],

  // Redhill Infrastructure Featured Projects
  featuredProjects: [
    {
      id: 'redhill-signature',
      name: 'Redhill Signature Towers',
      category: 'highrise',
      location: 'Whitefield, Bangalore',
      badge: 'New Launch',
      rating: '4.9/5',
      image: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=1200',
      priceStarting: '₹2.85 Cr onwards',
      configuration: '3 & 4 BHK Sky Condos',
      possessionDate: 'Dec 2026',
      carpetArea: '2,150 – 3,850 sq.ft.',
      description: 'An iconic landmark high-rise in Whitefield featuring ultra-luxury duplex sky condominiums, temperature-controlled infinity pools, and panoramic skyline vistas.',
      highlights: [
        'Helipad & Private Sky Club',
        'Triple-Height Grand Reception Lobby',
        'IGBC Platinum Green Certification',
        'Smart Home IoT Automation'
      ],
    },
    {
      id: 'redhill-emerald',
      name: 'Redhill Emerald Gardens',
      category: 'township',
      location: 'Sarjapur Road, Bangalore',
      badge: 'New Launch',
      rating: '4.8/5',
      image: 'https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&q=80&w=1200',
      priceStarting: '₹1.95 Cr onwards',
      configuration: '2, 3 & 3.5 BHK Forest Living',
      possessionDate: 'June 2027',
      carpetArea: '1,450 – 2,600 sq.ft.',
      description: 'Nature-infused residential community situated amidst 18 acres of lush green canopy, featuring organic botanical trails and biophilic architectural planning.',
      highlights: [
        '80% Open Green Canopy',
        'Olympic-Length Swimming Complex',
        'Solar-Powered Common Infrastructure',
        'Multi-Tier 24/7 Security'
      ],
    },
    {
      id: 'redhill-pinnacle',
      name: 'Redhill Pinnacle Heights',
      category: 'highrise',
      location: 'Hebbal / Airport Corridor, Bangalore',
      badge: 'Pre-Launch',
      rating: '4.7/5',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
      priceStarting: '₹3.40 Cr onwards',
      configuration: '4 & 5 BHK Penthouses',
      possessionDate: 'March 2027',
      carpetArea: '3,200 – 5,400 sq.ft.',
      description: 'Opulent penthouses on the fast-growing Airport Corridor offering private elevator entries, floor-to-ceiling glass facades, and curated concierge living.',
      highlights: [
        'Private Plunge Pool on Every Deck',
        'Bespoke Italian Marble Finishes',
        'Dedicated EV Rapid Charging Bays',
        'Direct Access to Express Highway'
      ],
    },
    {
      id: 'redhill-sovereign',
      name: 'Redhill Sovereign Estates',
      category: 'villas',
      location: 'Devanahalli, Bangalore',
      badge: 'Exclusive Edition',
      rating: '4.9/5',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200',
      priceStarting: '₹4.80 Cr onwards',
      configuration: '4 & 5 BHK Bespoke Villa Mansions',
      possessionDate: 'Nov 2026',
      carpetArea: '4,500 – 7,200 sq.ft.',
      description: 'A private gated enclave of handcrafted ultra-luxury villas with private landscaped courtyards, personal lap pools, and clubhouse privileges.',
      highlights: [
        'Private 500 sq.ft. Landscaped Garden',
        'Clubhouse with Squash & Tennis Courts',
        'Subterranean 3-Car Parking',
        '24/7 Butler & Chauffeur Services'
      ],
    },
  ] as ShowcaseProject[],

  // Referral Rewards Program
  referral: {
    headline: 'Refer & Earn Upto ₹7 Lakh INR',
    subtitle: 'Share the prestige of Redhill living with your inner circle. Receive direct milestone disbursements for every verified booking.',
    rewardHighlight: '₹7,00,000 INR per successful referral',
    steps: [
      { step: '01', title: 'Share Your Link', desc: 'Send your exclusive Redhill VIP referral code to friends and associates.' },
      { step: '02', title: 'Site Visit & Booking', desc: 'Your referral enjoys complimentary executive chauffeur service for property preview.' },
      { step: '03', title: 'Earn Payout', desc: 'Instant credit of up to ₹7 Lakh directly into your verified bank account.' }
    ]
  },

  // Events & Conclaves
  events: [
    {
      id: 1,
      title: 'Redhill Private Investor & Conclave 2026',
      date: 'Saturday, 17th October 2026 • 6:30 PM IST',
      location: 'The Oberoi / Leela Palace, Bangalore',
      tag: 'VIP By Invite',
      desc: 'Exclusive evening exploring high-yield real estate corridors, upcoming pre-launch allocations, and sovereign asset portfolio strategies.',
    },
    {
      id: 2,
      title: 'Redhill Signature Towers Sky Condos Preview',
      date: 'Sunday, 25th October 2026 • 11:00 AM IST',
      location: 'Signature Towers Experience Centre, Whitefield',
      tag: 'Site Walkthrough',
      desc: 'Experience mock duplex suites, sample materials, and interactive 3D model walkthrough with our chief architectural team.',
    },
  ],

  // Concierge Services
  services: [
    {
      title: 'VIP Chauffeur Site Tour',
      desc: 'Complimentary premium sedan pickup and drop for private property walkthroughs.',
      badge: 'Complimentary',
    },
    {
      title: 'Legal & Title Deeds Due-Diligence',
      desc: 'Direct consultation with senior real estate legal counsels for absolute title transparency.',
      badge: 'Certified',
    },
    {
      title: 'Preferential Mortgage & Wealth Advisory',
      desc: 'Pre-negotiated lending terms with premier private and nationalized banking partners.',
      badge: 'Fast-Track',
    },
    {
      title: 'Turnkey Architectural & Interior Packages',
      desc: 'End-to-end bespoke interior solutions customized by award-winning design studios.',
      badge: 'Custom',
    },
  ]
};
