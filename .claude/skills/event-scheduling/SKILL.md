---
name: event-scheduling
description: Create, manage, and schedule cycling events including route planning, participant management, calendar coordination, and logistics. Use for organizing rides, managing registrations, and event coordination.
allowed-tools: Read, Write, Edit, Bash, Grep
---

# Event Scheduling Skill

## Purpose

Manage all aspects of cycling event organization from planning through execution, including ride scheduling, route selection, participant management, and logistics coordination.

## Capabilities

### Event Creation
- Schedule Sunday rides
- Plan special events (kickoff, closing)
- Create social gatherings
- Schedule club meetings
- Set recurring events

### Route Planning
- Assign routes to dates
- Consider route difficulty
- Plan route variety
- Check route availability
- Set weather backup routes

### Participant Management
- Track registrations
- Manage waitlists
- Monitor capacity limits
- Handle cancellations
- Record attendance

### Calendar Management
- Avoid date conflicts
- Balance ride difficulty throughout season
- Ensure route variety
- Consider weather seasons
- Account for holidays

### Logistics Coordination
- Set start times and locations
- Plan coffee stops
- Arrange support vehicles
- Coordinate ride leaders
- Plan emergency contacts

## Event Types

### Sunday Rides (Primary)
**Frequency**: Every Sunday, March-October
**Start Time**: 09:00
**Duration**: 2-4 hours
**Distance**: 60-100km
**Participants**: 10-30 members

### Season Kickoff
**Timing**: First Sunday of March
**Type**: Social + Ride
**Special**: Welcome new members, season preview

### Season Closing
**Timing**: Last Sunday of October
**Type**: Ride + Celebration
**Special**: Awards, season recap

### Social Events
**Frequency**: 2-3 per season
**Type**: Non-riding activities
**Examples**: BBQ, bike maintenance workshop

### Club Meetings
**Frequency**: Quarterly
**Type**: Administrative
**Participants**: Leadership + interested members

## Scheduling Workflow

### 1. Season Planning
```
1. Create season (year, start_date, end_date)
2. Generate Sunday dates (March-October)
3. Use route suggestion algorithm
4. Review and adjust suggestions
5. Finalize schedule
6. Publish to members
```

### 2. Route Assignment
```
1. Select date to schedule
2. View route suggestions for that week
3. Consider:
   - Historical patterns
   - Route variety
   - Recent usage
   - Weather appropriateness
4. Assign route
5. Add notes (coffee stop, etc.)
6. Set weather backup if needed
```

### 3. Event Publishing
```
1. Set event details complete
2. Notify members (email/dashboard)
3. Enable registrations
4. Monitor sign-ups
5. Send reminders (Friday before ride)
```

## Route Suggestion Algorithm

### Inputs
- Week number in season (1-35)
- Already scheduled routes this season
- Route library
- Historical ride_history data

### Ranking Factors
1. **Tradition** (40%): How often was this route ridden in this week historically?
2. **Variety** (30%): How long since this route was last ridden?
3. **Distance** (30%): Does the distance match historical patterns for this week?

### Output
Top 3 suggested routes with explanations:
```
1. Kempen Classic (85km)
   - Ridden 4x in week 12 historically
   - Last ridden: 2023
   - Avg week 12 distance: 82km
   
2. Hageland Tour (78km)
   - Ridden 3x in week 12
   - Last ridden: 2024
   - Matches distance pattern
```

## Best Practices

### Planning
1. **Advance Notice**: Publish schedule at least 2 weeks ahead
2. **Variety**: Rotate through different regions and difficulties
3. **Progression**: Start season with easier rides, build up
4. **Weather**: Consider seasonal weather patterns
5. **Holidays**: Avoid major holidays

### Communication
1. **Clear Details**: Date, time, location, distance, difficulty
2. **Reminders**: Email Friday for Sunday ride
3. **Changes**: Immediate notification if cancelled or changed
4. **Weather**: Update if switching to backup route

### Safety
1. **Difficulty Appropriate**: Match to member skill levels
2. **Ride Leaders**: Assign experienced leaders
3. **Support**: Plan for mechanicals/emergencies
4. **Weather**: Have cancellation criteria
5. **Emergency Contacts**: Distribute to all participants

## Data Management

### Scheduled Ride Record
```typescript
{
  id: UUID,
  seasonId: UUID,
  routeId: UUID,
  rideDate: Date,
  startTime: Time (09:00),
  status: 'scheduled' | 'cancelled' | 'completed',
  notes: "Coffee stop at km 45",
  weatherBackup: UUID (alternative route),
}
```

### Event Record
```typescript
{
  id: UUID,
  title: "Season Kickoff 2025",
  description: "Welcome ride + coffee",
  eventDate: Date,
  eventTime: Time,
  location: "Clubhouse",
  eventType: 'kickoff' | 'social' | 'meeting' | 'closing',
}
```

## Monitoring & Reporting

### Key Metrics
- Rides per season
- Average participants per ride
- Route variety (unique routes used)
- Cancellation rate
- Popular vs underused routes

### Reports
- Season schedule (printable PDF)
- Participation trends
- Route usage analysis
- Member attendance records

## Integration Points

- Calendar API for member sync
- Weather API for forecasts
- Email service for notifications
- Mapping for route visualization
- Database for persistence
