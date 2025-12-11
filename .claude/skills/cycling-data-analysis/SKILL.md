---
name: cycling-data-analysis
description: Analyze member ride statistics, performance metrics, participation trends, and generate insights on cycling club activity. Use when evaluating member activity, calculating distances, identifying trends, or generating reports.
allowed-tools: Read, Bash, Grep
---

# Cycling Data Analysis Skill

## Purpose

Analyze cycling club data to provide actionable insights on member participation, route popularity, seasonal trends, and performance metrics.

## Capabilities

### Member Analytics
- Calculate total distance covered per member
- Track participation rates and attendance
- Identify most active members
- Analyze member engagement over time
- Generate member performance reports

### Route Analytics
- Identify most popular routes
- Analyze route difficulty distribution
- Calculate average distance per ride
- Track route usage patterns
- Identify underutilized routes

### Seasonal Analysis
- Compare season-over-season participation
- Identify peak riding months
- Analyze weather impact on participation
- Track seasonal route preferences
- Forecast next season participation

### Performance Metrics
- Calculate average ride completion rates
- Track member improvement over time
- Analyze elevation gain patterns
- Compare member performance by age group
- Identify fastest/slowest routes

## Data Sources

Access these database tables for analysis:
- `users` - Member information and payment status
- `scheduled_rides` - Calendar of planned rides
- `ride_history` - Historical ride data
- `routes` - Route library with metrics
- `events` - Non-ride activities

## Analysis Methods

### Participation Rate
```
participation_rate = (rides_attended / total_rides) × 100
```

### Member Engagement Score
```
engagement_score = (
  participation_rate × 0.4 +
  route_variety × 0.3 +
  consistency × 0.3
)
```

### Route Popularity Index
```
popularity = (times_ridden / weeks_available) × participation_avg
```

## Output Format

### Summary Reports
- Executive summary (3-5 key findings)
- Trends and patterns
- Recommendations for improvement
- Action items for leadership

### Detailed Analysis
- Data tables with key metrics
- Trend charts and visualizations
- Statistical significance notes
- Confidence intervals where applicable

### Member-Specific Reports
- Individual performance summary
- Comparison to club averages
- Improvement suggestions
- Achievement milestones

## Best Practices

1. **Data Privacy**: Aggregate data for group analysis, anonymize individual data
2. **Statistical Rigor**: Include sample sizes and confidence levels
3. **Context**: Always provide context for numbers (season, weather, holidays)
4. **Actionable**: Focus on insights that can drive decisions
5. **Visual**: Use clear tables and summaries for older users

## Example Queries

### Top 10 Active Members
```sql
SELECT 
  u.first_name, 
  u.last_name,
  COUNT(rh.id) as rides_attended,
  SUM(r.distance_km) as total_distance
FROM users u
JOIN ride_history rh ON rh.member_id = u.id
JOIN routes r ON r.id = rh.route_id
WHERE u.is_active = true
GROUP BY u.id
ORDER BY rides_attended DESC
LIMIT 10
```

### Most Popular Routes
```sql
SELECT 
  r.name,
  COUNT(sr.id) as times_scheduled,
  AVG(r.distance_km) as avg_distance,
  r.difficulty
FROM routes r
LEFT JOIN scheduled_rides sr ON sr.route_id = r.id
GROUP BY r.id
ORDER BY times_scheduled DESC
LIMIT 10
```

## Use Cases

- Monthly board reports
- Season planning insights
- Member engagement campaigns
- Route selection for scheduling
- Budget planning (participation forecasts)
- Recognition programs (top performers)
