// Central business details. Update these in one place and the whole site changes.
// Anything in [BRACKETS] is a placeholder waiting for real details.
export const site = {
  name: 'Simply N Sorted',
  tagline: 'We build it. We grow it. You are sorted.',
  description:
    'Simply N Sorted builds websites, custom software and CRMs, and runs performance and social media marketing — one team for building and growing your business online.',
  email: 'hello@simplynsorted.com', // TODO: confirm
  phone: '[YOUR PHONE]', // e.g. +91 98xxxxxxx
  whatsapp: '', // digits only with country code, e.g. 9198xxxxxxxx — leave empty to hide
  city: 'Mumbai, India', // TODO: confirm
  social: {
    instagram: '',
    linkedin: '',
  },
};

export const categories = [
  'Websites',
  'E-commerce',
  'Software & CRM',
  'Performance Marketing',
  'Social Media',
] as const;

export type Category = (typeof categories)[number];

export const nav = [
  { href: '/work/', label: 'Work' },
  { href: '/services/', label: 'Services' },
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' },
];
