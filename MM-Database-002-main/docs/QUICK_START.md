# Creator Performance Tracker - Quick Start Guide

## Overview
This system tracks content creator performance across multiple platforms (TikTok, Instagram, YouTube, Facebook) with automatic payment calculations based on commission rates.

## Key Workflows

### 1. Adding Creators
**Via Admin Dashboard:**
1. Go to "Creator Database" view
2. Click "New Creator" button
3. Fill in: Name, Discord Handle, Tier, Commission Rate
4. Add social media handles (optional)

**Via CSV Import:**
1. Go to "Import Creators" section
2. Upload CSV with columns:
   - `discordHandle` (required)
   - `name` (required)
   - `tiktok`, `instagram`, `youtube`, `facebook` (optional)
3. Bulk import creates all creators at once

### 2. Tracking Content (Discord Bot)
**Creator's Action:**
1. Post video link in designated Discord channel
2. Bot automatically detects platform
3. Creates submission record for review

**Manager's Action:**
1. Go to "Submissions" view
2. Review pending videos
3. Click "Approve" or "Reject"
4. Approved videos move to tracking

### 3. Viewing Performance
**Leaderboard:**
- Filter by: Period (7d, 30d, all), Metric (views, revenue, video count)
- Top creators ranked by selected metric

**Video Analytics:**
- All tracked videos displayed with stats
- Filter by creator, platform, status
- Refresh stats manually or automatically

### 4. Managing Payouts
**Automatic Calculation:**
1. Go to "Payouts" view
2. Select creator and period (YYYY-MM)
3. System auto-calculates: (Total Video Revenue × Commission Rate) / 100
4. Review and approve payout

**Manual Entry:**
1. Create payout with custom amount
2. Add notes if needed
3. Track through approval → payment workflow

## Dashboard Views

### Creator Database
- Overview of all creators
- Statistics cards showing totals
- Filterable table with search
- Export to CSV

### Videos
- All tracked content submissions
- Filter by status: pending, approved, rejected, published
- View engagement metrics (views, likes, shares, revenue)
- Manually refresh stats

### Discord Tracking
- Monitor bot submissions
- See unmatched submissions
- Quick approval/rejection

### Leaderboard
- Rankings by period and metric
- Compare creator performance
- Export for reports

### Payouts
- Payout history and status
- Automatic calculation from videos
- Approval workflow
- Mark as paid

### Reports
- Aggregate statistics
- Performance trends
- Commission analysis

## Admin Tasks

### Managing Roles
- **Admin**: Full access, create/modify all data
- **Manager**: Can approve submissions, manage payouts
- **Viewer**: Read-only access

### Google Sheets Integration
1. Export creators database
2. Export video analytics
3. Automatic sync history
4. Sync status tracking

## Data Sync

**Video Statistics:**
- YouTube: Auto-refresh via API
- Other platforms: Manual refresh available
- Last update timestamp visible in UI

**Payout Calculations:**
- Triggered when video approved
- Based on: Video Revenue × Creator Commission Rate
- Period: Calendar month (YYYY-MM)

## Tips & Best Practices

1. **Regular Reviews**: Check submissions daily for quick approval
2. **Commission Rates**: Adjust based on creator tier
3. **Video Revenue**: Update manually if platform doesn't provide API
4. **Export Data**: Monthly exports to Google Sheets for records
5. **Activity Log**: Review timeline to track changes

## Troubleshooting

**Submissions not appearing?**
- Check Discord handle matches exactly
- Ensure creator is marked as "Active"
- Bot might need restart if down

**Payout not calculating?**
- Verify videos are marked as "published"
- Check creator has commission rate > 0
- Ensure revenue is entered for videos

**Google Sheets export failing?**
- Verify API credentials configured
- Check sheet permissions
- Review sync history for error details

---

**System Updated**: May 20, 2026
**Version**: 2.0 (Refactored)
**Status**: Production Ready