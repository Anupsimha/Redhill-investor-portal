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
    headlinePrefix: 'Nothing Like',
    headlineMain: "You've Seen Before.",
    subheadline: 'Crafting landmark architectural marvels, integrated luxury townships, and sustainable smart living across Bangalore’s prime growth corridors.',
    ctaExploreText: 'Explore Featured Projects',
    ctaSiteVisitText: 'Book Visit',
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
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1600',
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
      gallery: [
        {
          url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1600',
          title: 'Tower Facade & Architectural Skyline',
          tag: 'Exterior'
        },
        {
          url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1600',
          title: 'Duplex Penthouse Living Room',
          tag: 'Living Suite'
        },
        {
          url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=1600',
          title: 'Temperature-Controlled Infinity Sky Pool',
          tag: 'Sky Amenities'
        },
        {
          url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1600',
          title: 'Master Bedroom Suite with City Balcony',
          tag: 'Bedrooms'
        },
        {
          url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1600',
          title: 'Triple-Height Grand Reception Lobby',
          tag: 'Lobby & Concierge'
        },
        {
          url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1600',
          title: 'Golden Hour Sunset Skyline Elevation',
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
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600',
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
      gallery: [
        {
          url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600',
          title: '18-Acre Biophilic Township Canopy',
          tag: 'Exterior & Parks'
        },
        {
          url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1600',
          title: 'Botanical Walkways & Manicured Lawns',
          tag: 'Landscape'
        },
        {
          url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=1600',
          title: 'Sunlit Living Room Overlooking Forest Canopy',
          tag: 'Interiors'
        },
        {
          url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=1600',
          title: 'Olympic-Length Resort Swimming Pavilion',
          tag: 'Clubhouse'
        },
        {
          url: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&q=80&w=1600',
          title: 'Private Garden Deck & Outdoor Patio',
          tag: 'Balcony'
        },
        {
          url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1600',
          title: 'Ayurvedic Wellness Spa & Yoga Retreat',
          tag: 'Wellness Pavilion'
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
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1600',
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
      gallery: [
        {
          url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1600',
          title: 'Airport Corridor High-Rise Elevation',
          tag: 'Exterior'
        },
        {
          url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1600',
          title: 'Private Penthouse Plunge Pool & Terrace',
          tag: 'Terrace Deck'
        },
        {
          url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1600',
          title: 'Italian Marble Designer Kitchen & Dining',
          tag: 'Interiors'
        },
        {
          url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1600',
          title: 'Panoramic Glass Deck Skyline Lounge',
          tag: 'Sky Lounge'
        }
      ]
    },
    {
      id: 'redhill-sovereign',
      name: 'Redhill Sovereign Estates',
      category: 'villas',
      location: 'Devanahalli, Bangalore',
      badge: 'Exclusive Edition',
      rating: '4.9/5',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1600',
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
      gallery: [
        {
          url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1600',
          title: 'Handcrafted Villa Mansion Architecture',
          tag: 'Exterior'
        },
        {
          url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1600',
          title: 'Double-Height Grand Living Room',
          tag: 'Interiors'
        },
        {
          url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1600',
          title: 'Private Courtyard & Temperature Heated Pool',
          tag: 'Courtyard Pool'
        },
        {
          url: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=1600',
          title: 'Presidential Master Suite with Garden Access',
          tag: 'Master Suite'
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
