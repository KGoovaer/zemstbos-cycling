# 051 - Attendance Tracking - Done

**Epic:** Future Enhancements
**Priority:** Could
**Estimated Effort:** 10 hours
**Phase:** 5

## User Story

As an **admin**
I want **to track who attended each ride**
So that **we have attendance records and participation statistics**

## Description

Allow admins to mark members as present/absent for each ride and generate attendance reports.

## Acceptance Criteria

- [ ] Mark members present/absent for a ride
- [ ] View attendance list for past rides
- [ ] Attendance statistics per member
- [ ] Export attendance reports
- [ ] View popular rides by attendance

## Technical Implementation

### Database Changes
Add table:
```sql
CREATE TABLE ride_attendance (
  id UUID PRIMARY KEY,
  scheduled_ride_id UUID REFERENCES scheduled_rides(id),
  user_id UUID REFERENCES users(id),
  attended BOOLEAN,
  UNIQUE(scheduled_ride_id, user_id)
);
```

## Dependencies

- **Depends on:** 002 - Database Schema, 035 - Schedule Management

## Notes

- **Privacy:** Only admins see full attendance
- **Statistics:** Show popular routes based on attendance
