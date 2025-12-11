# 033 - Route Library

**Epic:** Admin Features
**Priority:** Must
**Estimated Effort:** 6 hours
**Phase:** 3

## User Story

As an **admin**
I want **to view and manage the route library**
So that **I can organize available routes for scheduling**

## Description

View all routes in the library, search and filter them, edit route metadata, and see which routes haven't been used recently.

## Acceptance Criteria

- [ ] View all routes in library
- [ ] Search routes by name/region
- [ ] Filter by distance/difficulty
- [ ] See last ridden date
- [ ] See times ridden count
- [ ] Edit route metadata
- [ ] Delete routes (with confirmation)
- [ ] Link to upload new route

## Technical Implementation

### Database Changes
None (uses routes table)

### API Endpoints
- `GET /api/admin/routes` - List all routes
- `PUT /api/admin/routes/[id]` - Update route metadata
- `DELETE /api/admin/routes/[id]` - Delete route

### Components/Pages
- `/app/(admin)/admin/routes/page.tsx` - Route library
- `/app/(admin)/admin/routes/[id]/edit/page.tsx` - Edit route
- `/components/admin/RouteTable.tsx` - Route list table

## Dependencies

- **Depends on:** 004 - Role-Based Access

## UI/UX Notes

- Sortable columns (name, distance, last ridden)
- Search bar for quick filtering
- Edit button on each row

## Testing Considerations

- [ ] Route list displays correctly
- [ ] Search works
- [ ] Filters work
- [ ] Edit saves correctly
- [ ] Delete confirmation required

## Notes

- **Deletion:** Warn if route is scheduled for future rides
