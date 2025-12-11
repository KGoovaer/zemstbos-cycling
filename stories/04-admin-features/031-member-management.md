# 031 - Member Management

**Epic:** Admin Features
**Priority:** Must
**Estimated Effort:** 10 hours
**Phase:** 3

## User Story

As an **admin**
I want **to create, view, edit, and deactivate member accounts**
So that **I can manage club membership**

## Description

Complete CRUD interface for managing club members. Admins can add new members, update their information, change payment status, and deactivate accounts.

## Acceptance Criteria

- [ ] View list of all members
- [ ] Search and filter members
- [ ] Create new member account
- [ ] Edit member information
- [ ] Deactivate member account
- [ ] Update payment status
- [ ] Send invitation email to new members
- [ ] Export member list

## Technical Implementation

### Database Changes
None (uses users table)

### API Endpoints
- `GET /api/admin/members` - List all members
- `POST /api/admin/members` - Create member
- `PUT /api/admin/members/[id]` - Update member
- `DELETE /api/admin/members/[id]` - Deactivate member

### Components/Pages
- `/app/(admin)/admin/members/page.tsx` - Member list
- `/app/(admin)/admin/members/new/page.tsx` - Create member
- `/app/(admin)/admin/members/[id]/page.tsx` - Edit member
- `/components/admin/MemberTable.tsx` - Member list table
- `/components/admin/MemberForm.tsx` - Create/edit form

## Dependencies

- **Depends on:** 004 - Role-Based Access

## UI/UX Notes

- Searchable member table
- Clear edit/deactivate actions
- Confirmation before deactivation
- Form validation

## Testing Considerations

- [ ] Only admins can access
- [ ] Create member works
- [ ] Edit member works
- [ ] Deactivate works (doesn't delete)
- [ ] Search/filter works
- [ ] Form validation works

## Notes

- **Soft Delete:** Deactivate sets isActive=false, doesn't delete
- **Invitations:** Send welcome email with login instructions
