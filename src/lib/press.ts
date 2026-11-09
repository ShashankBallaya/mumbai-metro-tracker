/** Press coverage of the site. The footer links the latest; each story has a thank-you page under /press/. */
export interface PressStory {
  /** The page slug under /press/. */
  slug: string;
  outlet: string;
  outlet_mr: string;
  headline: string;
  writer: string;
  photographer?: string;
  /** Publication day, YYYY-MM-DD. */
  date: string;
  href: string;
  /** The outlet's own social posts of the story. */
  posts: { label: string; href: string }[];
}

export const PRESS: PressStory[] = [
  {
    slug: 'mid-day',
    outlet: 'mid-day',
    outlet_mr: 'मिड-डे',
    headline: 'Mumbai: New website built by 24-year-old tracks construction progress, costs and delays of 21 metro corridors',
    writer: 'Rajendra B. Aklekar',
    photographer: 'Satej Shinde',
    date: '2026-11-09',
    href: 'https://www.mid-day.com/mumbai/mumbai-news/article/mumbai-new-website-built-by-24-year-old-tracks-construction-progress-costs-and-delays-of-21-metro-corridors-23659102',
    posts: [
      { label: 'X', href: 'https://x.com/mid_day/status/2119635740267303175' },
      { label: 'Instagram', href: 'https://www.instagram.com/p/DfgYbl7H8jO/' },
    ],
  },
];

export const pressBySlug = (slug: string) => PRESS.find((p) => p.slug === slug);
