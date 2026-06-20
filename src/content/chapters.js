// All site copy as data. This is the single source of truth for the
// scrollytelling experience. Sourced from aimy-nextjs/src/app/* pages.

export const brand = {
  name: 'Aimy India',
  tagline: 'Nextgen Luminaries',
  badge: 'Made in India',
  email: 'info@aimyindia.in',
  phone: '+91 98765 43210',
  location: 'Kerala, India',
  legacyUrl: 'http://localhost:3000',
};

// Chapter order mirrors the existing site navigation.
// shape key maps to a generator in src/scene/shapes.js
export const chapters = [
  {
    id: 'hero',
    index: 0,
    eyebrow: 'Aimy · Nextgen Luminaries',
    align: 'left',
    shape: 'panel',
    title: 'Transform Your Space With <em>Brilliant LED</em> Lighting.',
    lede: 'Premium quality, energy-efficient lighting solutions manufactured in India.',
    body:
      'A new generation of luminaires, designed and built in Kerala. Indoor, outdoor, decorative, and architectural — every Aimy product is engineered for performance, longevity, and aesthetic brilliance.',
    stats: [
      { value: '5+', label: 'Years of Excellence' },
      { value: '100%', label: 'Quality Assured' },
      { value: '50+', label: 'Products' },
    ],
    cta: { label: 'Begin the experience', href: '#chapter-1' },
  },
  {
    id: 'why',
    index: 1,
    eyebrow: 'Why Aimy',
    align: 'right',
    shape: 'india',
    title: 'Energy Efficient. <em>Long Lifespan.</em> Made in India.',
    lede:
      'Our LED lights consume up to 80% less energy than traditional lighting. Built with premium components, Aimy products last for thousands of hours with low maintenance.',
    bullets: [
      'Up to 80% less energy use',
      'Premium die-cast aluminium',
      'CRI > 80 across the range',
      'IP-rated outdoor durability',
      'Proudly Make in India',
      '1–2 year standard warranty',
    ],
  },
  {
    id: 'about',
    index: 2,
    eyebrow: 'About · Who We Are',
    align: 'left',
    shape: 'circuit',
    title: 'A premier manufacturer of <em>Nextgen Luminaries.</em>',
    body:
      'Aimy India is a premier manufacturer and supplier of Nextgen Luminaries, dedicated to revolutionizing the way we illuminate our spaces. With a commitment to innovation, energy efficiency, and uncompromising quality, we have established ourselves as a trusted name in the LED lighting industry.',
    lede:
      'Our locally produced, world-class products span across residential, commercial, and industrial applications.',
    bullets: [
      'Mission: illuminate the world sustainably',
      'Vision: lead LED innovation globally',
      'Values: integrity, excellence, dedication',
    ],
  },
  {
    id: 'products',
    index: 3,
    eyebrow: 'Our Products',
    align: 'right',
    shape: 'billboard',
    title: 'Five Collections. <em>One Standard.</em>',
    body:
      'From elegant indoor fixtures to durable outdoor flood lights, every Aimy product is engineered to deliver exceptional performance and aesthetic brilliance.',
    bullets: [
      'Indoor Lighting — 4 SKUs',
      'Outdoor Lighting — 9 SKUs',
      'Decorative Lighting',
      'Mirvue Touchmirror — 5 SKUs',
      'Accessories & Mounts',
    ],
  },
  {
    id: 'gallery',
    index: 4,
    eyebrow: 'Gallery',
    align: 'left',
    shape: 'disc',
    title: 'Glimpses of our <em>events, projects,</em> and celebrations.',
    body:
      'A look inside the Aimy ecosystem — manufacturing milestones, dealer meets, and the moments our lighting comes to life across the country.',
    bullets: ['Celebrations', 'Events', 'Projects', 'Dealer Network'],
  },
  {
    id: 'news',
    index: 5,
    eyebrow: 'News · Updates',
    align: 'right',
    shape: 'marquee',
    title: 'Latest from <em>Aimy India.</em>',
    lede: 'Stay up to date with product launches, technical insights, and brand moments.',
    bullets: [
      'New range of outdoor flood lights',
      'The importance of CRI in indoor lighting',
      'Bulb Series expansion',
      'Junction Lights refresh',
    ],
  },
  {
    id: 'careers',
    index: 6,
    eyebrow: 'Careers · Join the team',
    align: 'left',
    shape: 'cube',
    title: 'Build your career with one of India’s <em>leading LED manufacturers.</em>',
    body:
      'We are always on the lookout for talented individuals. Sales, engineering, merchandising, retail — if lighting is your craft, we want to hear from you.',
    bullets: [
      'Sales Executive (Project)',
      'Sales Engineer',
      'Sales Executive (Retail)',
      'Lighting Installation Technician',
      'Merchandiser — Hardgoods',
    ],
    cta: { label: 'Send your resume', href: 'mailto:hr@aimyindia.in' },
  },
  {
    id: 'contact',
    index: 7,
    eyebrow: 'Get in touch',
    align: 'center',
    shape: 'dome',
    title: 'Let’s <em>illuminate</em> your next project.',
    body:
      'Whether you have a question about our products, need assistance with an order, or want to discuss a bulk purchase for your project, our team is ready to answer.',
    stats: [
      { value: 'Kerala', label: 'Head Office' },
      { value: 'info@aimyindia.in', label: 'Write to us' },
      { value: '+91 98765 43210', label: 'Mon–Sat · 9–6' },
    ],
    cta: { label: 'Contact sales', href: 'mailto:sales@aimyindia.in' },
  },
];

export const chapterCount = chapters.length;
