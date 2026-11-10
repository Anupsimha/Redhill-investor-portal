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

export interface ShowcaseProjectGalleryItem {
  url: string;
  title: string;
  tag: string;
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
  gallery: ShowcaseProjectGalleryItem[];
}

export const SHOWCASE_CONFIG = {
  // Brand Info
  brand: {
    name: 'Redhill Infra',
    taglineBadge: 'REDHILL PREMIER 2026 COLLECTION',
  },

  // Hero Section
  hero: {
    headlinePrefix: 'Boutique Living,',
    headlineMain: 'Crafted for Bengaluru.',
    subheadline: 'Thoughtfully proportioned low-rise and mid-rise boutique apartment residences with private sit-out decks, terracotta & timber detailing, and lush courtyard greens across Bengaluru’s prime neighbourhoods.',
    ctaExploreText: 'Explore Boutique Residences',
    ctaSiteVisitText: 'Book Visit',
    backgroundImage: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&q=85&w=2070',
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

  // Redhill Infrastructure Featured Projects (Bengaluru Boutique Apartments)
  featuredProjects: [
    {
      id: 'redhill-signature',
      name: 'Redhill Signature Towers',
      category: 'highrise',
      location: 'Whitefield, Bangalore',
      badge: 'New Launch',
      rating: '4.9/5',
      image: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&q=85&w=1600',
      priceStarting: '₹2.85 Cr onwards',
      configuration: '3 & 4 BHK Boutique Residences',
      possessionDate: 'Dec 2026',
      carpetArea: '2,150 – 3,450 sq.ft.',
      description: 'An intimate boutique apartment development in Whitefield featuring only two residences per floor, deep cantilevered sit-out balconies, and landscaped courtyard decks.',
      highlights: [
        'Low-Density: Only 2 Apartments Per Floor',
        'Terracotta Jali & Timber Arrival Court',
        'IGBC Platinum Green Certification',
        'Private Lift Lobby & Smart Home Automation'
      ],
      gallery: [
        {
          url: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&q=85&w=1600',
          title: 'Cantilevered Boutique Apartment Elevation',
          tag: 'Exterior'
        },
        {
          url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=85&w=1600',
          title: 'Sunlit Boutique Apartment Living Suite',
          tag: 'Living Suite'
        },
        {
          url: 'https://images.unsplash.com/photo-1580041065738-e72023775cdc?auto=format&fit=crop&q=85&w=1600',
          title: 'Landscaped Courtyard & Resident Lap Pool',
          tag: 'Courtyard Amenities'
        },
        {
          url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=85&w=1600',
          title: 'Open-Plan Dining & Lounge',
          tag: 'Interiors'
        },
        {
          url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=85&w=1600',
          title: 'Timber-Screened Double-Height Entrance Foyer',
          tag: 'Lobby & Concierge'
        },
        {
          url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=85&w=1600',
          title: 'Evening Facade & Recessed Balconies',
          tag: 'Twilight View'
        }
      ]
    },
    {
      id: 'redhill-emerald',
      name: 'Redhill Emerald Gardens',
      category: 'township',
      location: 'Sarjapur Road, Bangalore',
      badge: 'New Launch',
      rating: '4.8/5',
      image: 'https://images.unsplash.com/photo-1580041065738-e72023775cdc?auto=format&fit=crop&q=85&w=1600',
      priceStarting: '₹1.95 Cr onwards',
      configuration: '2, 3 & 3.5 BHK Courtyard Apartments',
      possessionDate: 'June 2027',
      carpetArea: '1,450 – 2,600 sq.ft.',
      description: 'Low-rise G+4 boutique garden apartments nestled amidst mature Bengaluru rain trees, featuring shaded pergola terraces, cross-ventilated floor plates, and a central lap pool.',
      highlights: [
        'Low-Rise G+4 Boutique Courtyard Blocks',
        'Central Lap Pool & Shaded Pergola Decks',
        'Solar-Powered Common Infrastructure',
        'Multi-Tier 24/7 Perimeter Security'
      ],
      gallery: [
        {
          url: 'https://images.unsplash.com/photo-1580041065738-e72023775cdc?auto=format&fit=crop&q=85&w=1600',
          title: 'Low-Rise Boutique Apartment Blocks & Canopy',
          tag: 'Exterior & Courtyard'
        },
        {
          url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=85&w=1600',
          title: 'Stone-Walled Courtyard Swimming Pavilion',
          tag: 'Clubhouse'
        },
        {
          url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=85&w=1600',
          title: 'Sunlit Living Room Opening to Verandah Deck',
          tag: 'Interiors'
        },
        {
          url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=85&w=1600',
          title: 'Biophilic Study & Lounge Corner',
          tag: 'Living Space'
        },
        {
          url: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&q=85&w=1600',
          title: 'Terracotta Brick Facade & Deep Sit-Out Balconies',
          tag: 'Balcony'
        },
        {
          url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=85&w=1600',
          title: 'Natural Oak Herringbone Apartment Suite',
          tag: 'Master Suite'
        }
      ]
    },
    {
      id: 'redhill-pinnacle',
      name: 'Redhill Pinnacle Heights',
      category: 'highrise',
      location: 'Hebbal / Airport Corridor, Bangalore',
      badge: 'Pre-Launch',
      rating: '4.7/5',
      image: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&q=85&w=1600',
      priceStarting: '₹3.40 Cr onwards',
      configuration: '3 & 4 BHK Terrace Apartments',
      possessionDate: 'March 2027',
      carpetArea: '2,800 – 4,200 sq.ft.',
      description: 'Warm brick-and-concrete boutique residences along the Hebbal–Airport corridor, crafted with private elevator foyers, wrap-around planter balconies, and curated concierge living.',
      highlights: [
        'Wrap-Around Landscaped Planter Balconies',
        'Exposed Brick & Architectural Concrete Facade',
        'Dedicated EV Rapid Charging Bays',
        '6 Mins from Manyata Tech Park & Hebbal Flyover'
      ],
      gallery: [
        {
          url: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&q=85&w=1600',
          title: 'Warm Brick Boutique Apartment Elevation',
          tag: 'Exterior'
        },
        {
          url: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&q=85&w=1600',
          title: 'Rooftop Pergola & Penthouse Crown',
          tag: 'Terrace Deck'
        },
        {
          url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=85&w=1600',
          title: 'Designer Kitchen & Timber Feature Wall',
          tag: 'Interiors'
        },
        {
          url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=85&w=1600',
          title: 'Corner Apartment Lounge with Dual Aspect Views',
          tag: 'Living Room'
        }
      ]
    },
    {
      id: 'redhill-sovereign',
      name: 'Redhill Sovereign Estates',
      category: 'villas',
      location: 'Indiranagar / Domlur Corridor, Bangalore',
      badge: 'Exclusive Edition',
      rating: '4.9/5',
      image: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&q=85&w=1600',
      priceStarting: '₹4.20 Cr onwards',
      configuration: '4 BHK Single-Floor Boutique Residences',
      possessionDate: 'Nov 2026',
      carpetArea: '3,600 – 4,800 sq.ft.',
      description: 'An ultra-exclusive G+5 boutique apartment address featuring one full-floor residence per level, private key-card elevator access, and a rooftop sky garden.',
      highlights: [
        'One Full-Floor Residence Per Level (5 Units Total)',
        'Rooftop Sky Deck & Private Resident Lounge',
        'Subterranean 3-Car Basement Parking',
        'Acoustic Double-Glazed Fenestration'
      ],
      gallery: [
        {
          url: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&q=85&w=1600',
          title: 'G+5 Full-Floor Boutique Residence Facade',
          tag: 'Exterior'
        },
        {
          url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=85&w=1600',
          title: 'Full-Floor Living & Entertaining Lounge',
          tag: 'Interiors'
        },
        {
          url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=85&w=1600',
          title: 'Private Courtyard Deck & Lap Pool',
          tag: 'Courtyard Pool'
        },
        {
          url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=85&w=1600',
          title: 'Timber-Louvered Arrival Foyer at Dusk',
          tag: 'Arrival Court'
        }
      ]
    },
  ] as ShowcaseProject[],

  // Referral Rewards Program
  referral: {
    badge: 'Redhill Referral Circle',
    headline: 'Refer & Earn ₹50,000 – ₹3,00,000 INR',
    subtitle: 'Introduce your friends, family & associates to Redhill’s landmark developments. Unlock milestone rewards directly disbursed to your bank account on every successful booking.',
    rewardHighlight: '₹50,000 – ₹3,00,000 INR per Booking',
    tagline: 'Together as One. Move into the circle of trust.',
    steps: [
      { step: '01', title: 'Submit Referral', desc: 'Introduce your loved ones to the Redhill community & signature properties.' },
      { step: '02', title: 'Track Referral', desc: 'Real-time updates as your referral completes guided walkthrough, booking & registration.' },
      { step: '03', title: 'Get Rewarded', desc: 'Direct disbursement of ₹50,000 to ₹3 Lakh into your verified account upon 10% payment.' }
    ]
  },

  // Events & Conclaves
  events: [
    {
      id: 1,
      title: 'Redhill Private Investor & Conclave 2026',
      date: 'Saturday, 17th October 2026 • 6:30 PM IST',
      location: 'The Oberoi / Leela Palace, Bangalore',
      tag: 'Exclusive Event',
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
      title: 'Guided Property Site Tour',
      desc: 'Complimentary premium pickup and drop for private property walkthroughs.',
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
