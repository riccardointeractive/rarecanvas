/**
 * Social Media Builder Configuration
 * 
 * Template definitions and default settings
 */

import { TemplateConfig, TemplateType } from '../types/social-media.types';

export const TEMPLATES: TemplateConfig[] = [
  {
    id: 'new-pair',
    name: 'New Pair Added',
    description: 'Announce a new trading pair on the DEX',
    defaultSize: '1080x1080',
    fields: [
      {
        id: 'headline',
        label: 'Headline',
        type: 'text',
        placeholder: 'New Pair Added',
        defaultValue: 'New Pair Added',
        required: true,
      },
      {
        id: 'subheadline',
        label: 'Subheadline',
        type: 'text',
        placeholder: 'Trade now on Rare Canvas DEX',
        defaultValue: 'Trade now on Rare Canvas DEX',
      },
    ],
  },
  {
    id: 'apr-promotion',
    name: 'APR Promotion',
    description: 'Promote staking rewards with APR highlight',
    defaultSize: '1080x1080',
    fields: [
      {
        id: 'headline',
        label: 'Headline',
        type: 'text',
        placeholder: 'Staking Is Live',
        defaultValue: 'Staking Is Live',
        required: true,
      },
      {
        id: 'apr',
        label: 'APR Percentage',
        type: 'text',
        placeholder: '10%',
        defaultValue: '10%',
        required: true,
      },
      {
        id: 'subheadline',
        label: 'Subheadline',
        type: 'text',
        placeholder: 'Earn rewards by holding!',
        defaultValue: 'Earn rewards by holding!',
      },
    ],
  },
  {
    id: 'listing',
    name: 'Token Listing',
    description: 'Announce a new token listing',
    defaultSize: '1080x1080',
    fields: [
      {
        id: 'headline',
        label: 'Headline',
        type: 'text',
        placeholder: 'Now Listed',
        defaultValue: 'Now Listed',
        required: true,
      },
      {
        id: 'subheadline',
        label: 'Subheadline',
        type: 'text',
        placeholder: 'Available for trading',
        defaultValue: 'Available for trading on Rare Canvas',
      },
    ],
  },
  {
    id: 'announcement',
    name: 'General Announcement',
    description: 'General purpose announcement template',
    defaultSize: '1200x630',
    fields: [
      {
        id: 'headline',
        label: 'Headline',
        type: 'text',
        placeholder: 'Big News!',
        defaultValue: 'Announcement',
        required: true,
      },
      {
        id: 'subheadline',
        label: 'Subheadline',
        type: 'text',
        placeholder: 'Something exciting is coming...',
        defaultValue: 'Something exciting is happening',
      },
      {
        id: 'bodyText',
        label: 'Body Text',
        type: 'text',
        placeholder: 'Additional details here',
        defaultValue: '',
      },
    ],
  },
  {
    id: 'milestone',
    name: 'Milestone Celebration',
    description: 'Celebrate platform milestones',
    defaultSize: '1080x1080',
    fields: [
      {
        id: 'number',
        label: 'Milestone Number',
        type: 'text',
        placeholder: '1,000,000',
        defaultValue: '1,000,000',
        required: true,
      },
      {
        id: 'metric',
        label: 'Metric Type',
        type: 'select',
        options: [
          { value: 'transactions', label: 'Transactions' },
          { value: 'users', label: 'Users' },
          { value: 'volume', label: 'Trading Volume' },
          { value: 'tvl', label: 'Total Value Locked' },
          { value: 'holders', label: 'Token Holders' },
        ],
        defaultValue: 'transactions',
        required: true,
      },
      {
        id: 'headline',
        label: 'Headline',
        type: 'text',
        placeholder: 'Milestone Reached!',
        defaultValue: 'Milestone Reached!',
      },
    ],
  },
  {
    id: 'season-announcement',
    name: 'Season Announcement',
    description: 'Announce a new CTR Kart racing season with prize pool',
    defaultSize: '1080x1080',
    fields: [
      {
        id: 'headline',
        label: 'Headline',
        type: 'text',
        placeholder: 'New Season Starts!',
        defaultValue: 'New Season Starts!',
        required: true,
      },
      {
        id: 'prizePool',
        label: 'Prize Pool',
        type: 'text',
        placeholder: '20,000',
        defaultValue: '20,000',
        required: true,
      },
      {
        id: 'prizeToken',
        label: 'Prize Token',
        type: 'text',
        placeholder: 'KLV',
        defaultValue: 'KLV',
      },
      {
        id: 'topPlayers',
        label: 'Top N Players',
        type: 'text',
        placeholder: '10',
        defaultValue: '10',
        required: true,
      },
      {
        id: 'duration',
        label: 'Season Duration',
        type: 'select',
        options: [
          { value: '3 days', label: '3 Days' },
          { value: '5 days', label: '5 Days' },
          { value: '7 days', label: '7 Days (1 Week)' },
          { value: '14 days', label: '14 Days (2 Weeks)' },
          { value: '30 days', label: '30 Days (1 Month)' },
        ],
        defaultValue: '7 days',
      },
      {
        id: 'subheadline',
        label: 'Call to Action',
        type: 'text',
        placeholder: 'Race to win!',
        defaultValue: 'Race to win!',
      },
      {
        id: 'gameName',
        label: 'Game Name',
        type: 'text',
        placeholder: 'CTR Kart',
        defaultValue: 'CTR Kart',
      },
    ],
  },
];

export const DEFAULT_DISCLAIMER = 'This is for informational purposes only and does not constitute financial advice. Investments involve risk. Please do your own research before investing.';

export const BRAND_CONFIG = {
  name: 'Rare Canvas',
  logo: '/images/rarecanvas-logo.png',
  primaryColor: '#7B2CBF',
  tagline: 'Web3 DeFi Ecosystem',
  website: 'rarecanvas.io',
};

export function getTemplateConfig(templateId: TemplateType): TemplateConfig | undefined {
  return TEMPLATES.find(t => t.id === templateId);
}
