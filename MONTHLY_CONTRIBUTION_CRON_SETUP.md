# Monthly Contribution Auto-Increment Setup

This document explains how to set up the automatic monthly contribution increment system that runs on the 10th day of every month.

## Overview

The system automatically increases all users' `totalContribution` by their `monthlyContribution` amount on the 10th day of every month.

## API Endpoints

### 1. Monthly Contribution Increment

- **URL**: `/api/monthly-contribution`
- **Method**: `POST`
- **Description**: Executes the monthly contribution increment for all users
- **Security**: Only runs on the 10th day of each month

### 2. Monthly Contribution Status

- **URL**: `/api/monthly-contribution`
- **Method**: `GET`
- **Description**: Returns current status and next increment date

### 3. Cron Job Endpoint

- **URL**: `/api/cron/monthly-contribution`
- **Method**: `GET`
- **Description**: Endpoint for cron services to trigger the increment
- **Security**: Requires `CRON_SECRET` environment variable

## Environment Variables

Add these to your `.env.local` file:

```env
# Required for Convex client
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here

# Optional: For cron job security
CRON_SECRET=your_secure_random_string_here
```

## Cron Job Setup

### Option 1: Vercel Cron Jobs (Recommended)

If deploying on Vercel, add this to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/monthly-contribution",
      "schedule": "0 0 10 * *"
    }
  ]
}
```

### Option 2: External Cron Service

Use a service like cron-job.org, EasyCron, or GitHub Actions:

**Cron Expression**: `0 0 10 * *` (Runs at 00:00 on the 10th day of every month)

**URL**: `https://your-domain.com/api/cron/monthly-contribution`

**Headers** (if CRON_SECRET is set):

```
Authorization: Bearer your_cron_secret_here
```

### Option 3: GitHub Actions

Create `.github/workflows/monthly-contribution.yml`:

```yaml
name: Monthly Contribution Increment

on:
  schedule:
    - cron: "0 0 10 * *" # Runs at 00:00 on the 10th day of every month

jobs:
  increment-contributions:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Monthly Contribution Increment
        run: |
          curl -X GET "https://your-domain.com/api/cron/monthly-contribution" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## Testing

### Manual Test (Any Day)

```bash
curl -X POST https://your-domain.com/api/monthly-contribution
```

This will return a message indicating it only runs on the 10th day.

### Manual Test (10th Day)

```bash
curl -X POST https://your-domain.com/api/monthly-contribution
```

This will execute the increment for all users.

### Check Status

```bash
curl -X GET https://your-domain.com/api/monthly-contribution
```

This shows current status and next increment date.

## Security Features

1. **Date Validation**: Only runs on the 10th day of each month
2. **Authentication**: Cron endpoint requires CRON_SECRET
3. **Error Handling**: Comprehensive error handling and logging
4. **Audit Trail**: All increments are logged with timestamps
5. **Transaction Safety**: Each user update is handled individually

## Monitoring

### Logs

The system logs all activities:

- Successful increments with user details
- Failed updates with error messages
- Summary statistics after completion

### Status Endpoint

Use the GET endpoint to monitor:

- Current date and next increment date
- Total users and contribution amounts
- Individual user status

## Troubleshooting

### Common Issues

1. **Cron job not running**
   - Check cron service configuration
   - Verify URL is accessible
   - Check CRON_SECRET if configured

2. **API returns 404**
   - Ensure the API routes are properly deployed
   - Check environment variables

3. **Database errors**
   - Verify Convex connection
   - Check user data integrity

### Debug Mode

Add logging to see detailed information:

```bash
curl -X POST https://your-domain.com/api/monthly-contribution -v
```

## Example Response

### Successful Increment (10th Day)

```json
{
  "success": true,
  "message": "Monthly contribution increment completed successfully on Mon Dec 10 2024",
  "summary": {
    "date": "2024-12-10T00:00:00.000Z",
    "totalUsers": 5,
    "successfulUpdates": 5,
    "failedUpdates": 0,
    "totalIncrementAmount": 250000
  },
  "results": [
    {
      "userId": "user_id_1",
      "userName": "John Doe",
      "userPin": "123456",
      "previousTotal": 50000,
      "newTotal": 75000,
      "increment": 25000,
      "success": true
    }
  ]
}
```

### Status Check

```json
{
  "success": true,
  "message": "Monthly contribution status retrieved successfully",
  "status": {
    "currentDate": "2024-12-05T10:30:00.000Z",
    "isTenthDay": false,
    "nextTenthDay": "2024-12-10T00:00:00.000Z",
    "daysUntilNextIncrement": 5,
    "totalUsers": 5,
    "totalMonthlyContributions": 250000,
    "totalCurrentContributions": 1250000
  }
}
```
