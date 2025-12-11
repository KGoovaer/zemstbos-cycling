# 038 - Season Management

**Epic:** Admin Features
**Priority:** Must
**Estimated Effort:** 4 hours
**Phase:** 3

## User Story

As an **admin**
I want **to create and activate cycling seasons**
So that **I can manage different years' schedules**

## Description

Create new seasons with start/end dates and activate them. Only one season can be active at a time.

## Acceptance Criteria

- [ ] Create new season
- [ ] Set season year
- [ ] Set start date (e.g., first Sunday of March)
- [ ] Set end date (e.g., last Sunday of October)
- [ ] Activate/deactivate season
- [ ] Only one active season at a time
- [ ] View all past seasons

## Technical Implementation

### Database Changes
None (uses seasons table)

### API Endpoints
- `POST /api/admin/seasons` - Create season
- `PUT /api/admin/seasons/[id]` - Update season
- `PUT /api/admin/seasons/[id]/activate` - Activate season

### Components/Pages
- `/app/(admin)/admin/seasons/page.tsx` - Season list
- `/app/(admin)/admin/seasons/new/page.tsx` - Create season

## Dependencies

- **Depends on:** 002 - Database Schema
- **Blocks:** 035 - Schedule Management

## UI/UX Notes

- Clear indication of active season
- Date pickers for start/end
- Confirmation before activating

## Testing Considerations

- [ ] Create season works
- [ ] Only one active season
- [ ] Activating deactivates others
- [ ] Date validation works

## Notes

- **Typical Season:** March to October (8 months)
- **Pre-create:** Create next season in advance
