# 037 - Event Management

**Epic:** Admin Features
**Priority:** Should
**Estimated Effort:** 6 hours
**Phase:** 3

## User Story

As an **admin**
I want **to create and manage club events**
So that **members can see social activities and special gatherings**

## Description

CRUD interface for non-ride events like season kickoff, social gatherings, meetings, and closing events.

## Acceptance Criteria

- [ ] Create new event
- [ ] Edit event details
- [ ] Delete event
- [ ] Set event type (kickoff/social/meeting/closing)
- [ ] Set date, time, location
- [ ] Add description
- [ ] Events appear on member events page

## Technical Implementation

### Database Changes
None (uses events table)

### API Endpoints
- `POST /api/admin/events` - Create event
- `PUT /api/admin/events/[id]` - Update event
- `DELETE /api/admin/events/[id]` - Delete event

### Components/Pages
- `/app/(admin)/admin/events/page.tsx` - Event list
- `/app/(admin)/admin/events/new/page.tsx` - Create event
- `/app/(admin)/admin/events/[id]/edit/page.tsx` - Edit event

## Dependencies

- **Depends on:** 004 - Role-Based Access
- **Related:** 027 - Events List (member view)

## UI/UX Notes

- Simple form interface
- Event type dropdown
- Date/time picker
- Rich text for description

## Testing Considerations

- [ ] Create event works
- [ ] Edit saves correctly
- [ ] Delete removes event
- [ ] Events visible to members

## Notes

- **Event Types:** kickoff, social, meeting, closing
