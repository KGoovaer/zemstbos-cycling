# 036 - Route Suggestions

**Epic:** Admin Features
**Priority:** Should
**Estimated Effort:** 8 hours
**Phase:** 3

## User Story

As an **admin**
I want **route suggestions based on historical patterns**
So that **I can plan a varied and traditional season schedule**

## Description

Algorithm that suggests routes for each week based on: when they were historically ridden, how long since last ridden, and distance patterns.

## Acceptance Criteria

- [ ] Suggestions shown when scheduling a ride
- [ ] Top 3 suggestions per week
- [ ] Shows why route is suggested
- [ ] Filters out already-scheduled routes
- [ ] Can override and choose different route
- [ ] Suggestions based on week number within season

## Technical Implementation

### Database Changes
None (uses ride_history table)

### API Endpoints
- `GET /api/admin/suggestions/week/[weekNumber]` - Get suggestions

### Algorithm
```javascript
// See cycling-club-plan.md lines 206-267 for pseudocode
// 1. Calculate week number in season (1-35)
// 2. Find routes historically ridden in that week
// 3. Exclude already scheduled routes
// 4. Rank by:
//    - Tradition factor (how often in this week)
//    - Variety factor (time since last ridden)
//    - Distance similarity
// 5. Return top 3
```

## Dependencies

- **Depends on:** 035 - Schedule Management, 039 - Bulk Import Tools

## UI/UX Notes

- Suggestions in ranked order
- Clear explanation of ranking
- Easy to accept or skip suggestion

## Testing Considerations

- [ ] Suggestions based on correct week
- [ ] Already-scheduled routes excluded
- [ ] Ranking makes sense
- [ ] Can choose non-suggested route

## Notes

- **Historical Data:** Requires ride_history populated (story 039)
