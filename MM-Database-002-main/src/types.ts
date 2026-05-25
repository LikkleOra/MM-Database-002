/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Tier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
export type Platform = 'TikTok' | 'Instagram' | 'YouTube' | 'Facebook';
export type VideoStatus = 'pending' | 'approved' | 'rejected' | 'published';
export type ActivityType = 'win' | 'loss' | 'observation' | 'adjustment';

export interface SocialAccounts {
  tiktok?: string;
  instagram?: string;
  youtube?: string;
  facebook?: string;
  twitch?: string;
}

export interface Creator {
  id: string;
  name: string;
  discordHandle: string;
  tier: Tier;
  isActive: boolean;
  commissionRate: number;
  socialAccounts?: SocialAccounts;
  joinedAt: string;
  profile?: {
    realName?: string;
    email?: string;
    phone?: string;
    location?: string;
    niche?: string;
    contentFormat?: string;
    toneVibe?: string;
    postingFrequency?: string;
  };
  managerId?: string;
}

export interface Video {
  id: string;
  creatorId: string;
  creatorName: string;
  platform: Platform;
  externalId: string;
  title: string;
  contentUrl: string;
  thumbnailUrl?: string;
  views: number;
  likes?: number;
  shares?: number;
  comments?: number;
  revenue?: number;
  status: VideoStatus;
  recordedAt: string;
  statsRefreshedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface Activity {
  id: string;
  creatorId: string;
  type: ActivityType;
  title: string;
  description: string;
  recordedBy: string;
  recordedAt: string;
  impact?: 'high' | 'medium' | 'low';
}

export interface Payout {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorTier: Tier;
  amount: number;
  period: string; // "YYYY-MM"
  status: 'pending' | 'approved' | 'paid' | 'denied';
  notes?: string;
  createdAt: string;
  processedAt?: string;
  createdBy: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
}
