# 035 - Schedule Management - donecan

**Epic:** Admin Features
**Priority:** Must
**Estimated Effort:** 16 hours
**Phase:** 3

## User Story

As an **admin**
I want **to assign routes to specific dates in the season**
So that **members know which ride is happening each Sunday**

## Description

Calendar interface for admins to assign routes to Sunday dates. Includes route suggestions based on historical data (see story 036).

## Acceptance Criteria

- [ ] Calendar view of season
- [ ] Assign route to date
- [ ] Edit scheduled ride
- [ ] Add notes to ride
- [ ] Set weather backup route
- [ ] Mark ride as cancelled
- [ ] See route suggestions for each week
- [ ] Bulk schedule generation

## Technical Implementation

### Database Changes
None

### API Endpoints
- `POST /api/admin/schedule` - Create scheduled ride
- `PUT /api/admin/schedule/[id]` - Update scheduled ride
- `DELETE /api/admin/schedule/[id]` - Delete scheduled ride

### Components/Pages
- `/app/(admin)/admin/schedule/page.tsx` - Schedule management
- `/components/admin/ScheduleCalendar.tsx` - Interactive calendar
- `/components/admin/AssignRouteModal.tsx` - Assign route dialog
- `/components/admin/RouteSuggestions.tsx` - Suggested routes

## Dependencies

- **Depends on:** 033 - Route Library, 038 - Season Management
- **Related:** 036 - Route Suggestions

## UI/UX Notes

- Visual calendar with drag-and-drop
- Route suggestions highlighted
- Clear indication of scheduled/unscheduled dates

## Testing Considerations

- [ ] Can assign route to date
- [ ] Can edit ride details
- [ ] Can add notes
- [ ] Cannot schedule multiple rides on same date
- [ ] Suggestions display correctly

## Notes

- **Sundays Only:** Default to Sunday dates
- **Conflicts:** Warn if date already has ride
