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
  landArea?: string;
  floors?: string;
  statusText?: string;
  description: string;
  highlights: string[];
  gallery: ShowcaseProjectGalleryItem[];
}

export const SHOWCASE_CONFIG = {
  // Brand Info
  brand: {
    name: 'Redhill Infra',
    taglineBadge: 'CONTEMPORARY BOUTIQUE HIGH-RISE LIVING · BENGALURU',
  },

  // Hero Section
  hero: {
    headlinePrefix: 'Thoughtfully Designed.',
    headlineMain: 'Built for Better Living.',
    subheadline: 'Contemporary residential communities crafted for modern urban living.',
    ctaExploreText: 'Explore Developments',
    ctaSiteVisitText: 'Book Visit',
    backgroundImage: '/assets/projects/hero-highrise.jpg',
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

  // Redhill Infrastructure Featured Projects (Bengaluru 12+ Floor Boutique High-Rise Communities)
  featuredProjects: [
    {
      id: 'redhill-signature',
      name: 'Redhill Signature Towers',
      category: 'highrise',
      location: 'Whitefield, Bengaluru',
      badge: 'Under Construction',
      rating: '4.9/5',
      image: '/assets/projects/signature-towers.jpg',
      priceStarting: '₹2.85 Cr onwards',
      configuration: '3 & 4 BHK Boutique Residences',
      possessionDate: 'Dec 2026',
      carpetArea: '2,150 – 3,450 sq.ft.',
      landArea: '5 Acres',
      floors: 'G + 15 Floors',
      statusText: 'Under Construction',
      description: 'A 5-acre contemporary high-rise residential community in Whitefield featuring 15-storey boutique towers, deep cantilevered sit-out balconies, vertical architectural louvers, and landscaped courtyard greens.',
      highlights: [
        '5-Acre Landscaped Community · G+15 Storeys',
        'Warm Sandstone & Vertical Louver Facade',
        'Deep Sit-Out Balconies with Planter Decks',
        'Private Lift Foyers & Resident Clubhouse'
      ],
      gallery: [
        {
          url: '/assets/projects/signature-towers.jpg',
          title: '15-Storey Boutique High-Rise Elevation',
          tag: 'Exterior'
        },
        {
          url: '/assets/projects/hero-highrise.jpg',
          title: 'Landscaped Arrival Court & Evening Facade',
          tag: 'Arrival Court'
        },
        {
          url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=85&w=1600',
          title: 'Sunlit Living & Dining Suite',
          tag: 'Living Suite'
        },
        {
          url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=85&w=1600',
          title: 'Contemporary Open-Plan Lounge',
          tag: 'Interiors'
        },
        {
          url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=85&w=1600',
          title: 'Timber-Screened Double-Height Entrance Lobby',
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
      location: 'Sarjapur Road, Bengaluru',
      badge: 'New Launch',
      rating: '4.8/5',
      image: '/assets/projects/emerald-gardens.jpg',
      priceStarting: '₹1.95 Cr onwards',
      configuration: '2, 3 & 3.5 BHK Courtyard Apartments',
      possessionDate: 'June 2027',
      carpetArea: '1,450 – 2,600 sq.ft.',
      landArea: '4 Acres',
      floors: 'G + 12 Floors',
      statusText: 'Active Development',
      description: 'Spread across 4 acres on Sarjapur Road, Redhill Emerald Gardens pairs twin 12-storey modern residential towers with a central vehicle-free botanical courtyard, shaded pergola walkways, and cross-ventilated floor plates.',
      highlights: [
        '4-Acre Botanical Courtyard · G+12 Storeys',
        'Cross-Ventilated Corner Residences',
        'Central Lap Pool & Shaded Pergola Walkways',
        'Solar-Integrated Common Infrastructure'
      ],
      gallery: [
        {
          url: '/assets/projects/emerald-gardens.jpg',
          title: '12-Storey Courtyard Towers & Central Greens',
          tag: 'Exterior & Courtyard'
        },
        {
          url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=85&w=1600',
          title: 'Courtyard Swimming Pavilion & Deck',
          tag: 'Clubhouse'
        },
        {
          url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=85&w=1600',
          title: 'Sunlit Living Room Opening to Balcony Deck',
          tag: 'Interiors'
        },
        {
          url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=85&w=1600',
          title: 'Biophilic Study & Lounge Corner',
          tag: 'Living Space'
        },
        {
          url: '/assets/projects/signature-towers.jpg',
          title: 'Warm Neutral Facade & Recessed Balconies',
          tag: 'Balcony'
        },
        {
          url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=85&w=1600',
          title: 'Natural Oak Herringbone Master Suite',
          tag: 'Master Suite'
        }
      ]
    },
    {
      id: 'redhill-pinnacle',
      name: 'Redhill Pinnacle Heights',
      category: 'highrise',
      location: 'Hebbal, North Bengaluru',
      badge: 'Pre-Launch',
      rating: '4.7/5',
      image: '/assets/projects/pinnacle-heights.jpg',
      priceStarting: '₹3.40 Cr onwards',
      configuration: '3 & 4 BHK Sky Terrace Residences',
      possessionDate: 'March 2027',
      carpetArea: '2,800 – 4,200 sq.ft.',
      landArea: '2 Acres',
      floors: 'G + 16 Floors',
      statusText: 'Pre-Launch',
      description: 'A refined 2-acre, 16-storey boutique residential enclave along the Hebbal–Airport corridor, designed with warm architectural concrete facades, wrap-around planter balconies, and private elevator foyers.',
      highlights: [
        '2-Acre Boutique Enclave · G+16 Storeys',
        'Wrap-Around Landscaped Planter Balconies',
        'Dedicated EV Charging Bays & Resident Lounge',
        '6 Mins from Manyata Tech Park & Hebbal Flyover'
      ],
      gallery: [
        {
          url: '/assets/projects/pinnacle-heights.jpg',
          title: '16-Storey Boutique High-Rise at Dusk',
          tag: 'Exterior'
        },
        {
          url: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&q=85&w=1600',
          title: 'Sky Terrace & Architectural Crown',
          tag: 'Terrace Deck'
        },
        {
          url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=85&w=1600',
          title: 'Designer Kitchen & Timber Feature Wall',
          tag: 'Interiors'
        },
        {
          url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=85&w=1600',
          title: 'Corner Residence Lounge with Dual-Aspect Views',
          tag: 'Living Room'
        }
      ]
    },
    {
      id: 'redhill-sovereign',
      name: 'Redhill Sovereign Estates',
      category: 'villas',
      location: 'Indiranagar Corridor, Bengaluru',
      badge: 'Exclusive Edition',
      rating: '4.9/5',
      image: '/assets/projects/sovereign-estates.jpg',
      priceStarting: '₹4.20 Cr onwards',
      configuration: '4 BHK Full-Floor Sky Residences',
      possessionDate: 'Nov 2026',
      carpetArea: '3,600 – 4,800 sq.ft.',
      landArea: '2 Acres',
      floors: 'G + 12 Floors',
      statusText: 'Exclusive Edition',
      description: 'An intimate 2-acre, 12-storey boutique residential address off Indiranagar featuring expansive sky residences, private lift lobbies, wrap-around planted decks, and a curated rooftop resident pavilion.',
      highlights: [
        '2-Acre Boutique Address · G+12 Storeys',
        'Expansive planted Sky-Decks on Every Floor',
        'Subterranean 3-Car Resident Parking',
        'Acoustic Double-Glazed Fenestration'
      ],
      gallery: [
        {
          url: '/assets/projects/sovereign-estates.jpg',
          title: '12-Storey Boutique Sky-Deck Tower',
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
