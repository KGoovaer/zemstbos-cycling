---
name: payment-processing
description: Manage member payment status, track annual fees, process renewals, and generate payment reports. Use for financial tracking and membership fee management.
allowed-tools: Read, Write, Edit, Bash
---

# Payment Processing Skill

## Purpose

Track and manage member payment status for annual cycling club membership fees, handle renewals, and generate financial reports.

## Capabilities

### Payment Tracking
- Record payment receipts
- Update payment status
- Set payment year
- Track payment methods
- Handle partial payments
- Manage exemptions

### Membership Fees
- Set annual fee amount
- Track fee changes over years
- Calculate pro-rated fees
- Handle family memberships
- Manage student/senior discounts

### Payment Status Management
- Mark as paid/unpaid
- Set payment expiration
- Track payment history
- Handle late payments
- Process refunds

### Reporting
- Payment status summaries
- Revenue projections
- Outstanding payments report
- Payment history by member
- Annual financial reports

## Payment Statuses

### Status Types
```typescript
type PaymentStatus = 
  | 'paid'      // Current year paid
  | 'unpaid'    // Not paid for current year
  | 'exempt'    // Honorary/lifetime members
```

### Status Transitions
```
unpaid → paid (when payment received)
paid → unpaid (when year changes and not renewed)
paid/unpaid → exempt (admin decision for honorary members)
```

## Payment Workflow

### New Member Registration
1. Create member account
2. Set paymentStatus = 'unpaid'
3. Set paymentYear = current year
4. Send payment instructions
5. Track payment received
6. Update to paymentStatus = 'paid'

### Annual Renewal
1. Check approaching expiration (1 month before)
2. Send renewal reminder
3. Provide payment instructions
4. Wait for payment
5. Update paymentYear and paymentStatus
6. Send confirmation

### Payment Receipt
1. Verify payment amount
2. Update member record:
   ```typescript
   await prisma.user.update({
     where: { id: memberId },
     data: {
       paymentStatus: 'paid',
       paymentYear: currentYear,
       updatedAt: new Date(),
     }
   })
   ```
3. Send receipt/confirmation
4. Log transaction

## Payment Methods

### Accepted Methods
- Bank transfer
- Cash (at club events)
- Online payment (future)

### Payment Tracking
```typescript
interface PaymentRecord {
  memberId: UUID
  amount: number
  paymentMethod: 'bank' | 'cash' | 'online'
  paymentDate: Date
  seasonYear: number
  receiptNumber: string
  notes?: string
}
```

## Fee Structure

### Standard Membership
- Annual fee: €50 (example)
- Covers: March-October season
- Includes: All Sunday rides, club events

### Special Cases
- **New member mid-season**: Pro-rated based on months remaining
- **Family membership**: Discounted rate for multiple members
- **Student/Senior**: Reduced rate (if applicable)
- **Honorary members**: Exempt status

### Fee Calculation
```javascript
function calculateFee(joinDate, currentYear, memberType) {
  const standardFee = 50 // euros
  const monthsInSeason = 8 // March-October
  const monthsRemaining = calculateMonthsRemaining(joinDate, currentYear)
  
  if (memberType === 'honorary') return 0
  if (memberType === 'student') return standardFee * 0.7
  
  // Pro-rate for mid-season joins
  if (monthsRemaining < monthsInSeason) {
    return standardFee * (monthsRemaining / monthsInSeason)
  }
  
  return standardFee
}
```

## Reporting

### Payment Status Summary
```sql
SELECT 
  COUNT(*) as total_members,
  SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid,
  SUM(CASE WHEN payment_status = 'unpaid' THEN 1 ELSE 0 END) as unpaid,
  SUM(CASE WHEN payment_status = 'exempt' THEN 1 ELSE 0 END) as exempt
FROM users
WHERE is_active = true
```

### Revenue Report
```sql
SELECT 
  payment_year,
  COUNT(*) as paying_members,
  COUNT(*) * 50 as total_revenue
FROM users
WHERE payment_status = 'paid'
GROUP BY payment_year
ORDER BY payment_year DESC
```

### Outstanding Payments
```sql
SELECT 
  first_name,
  last_name,
  email,
  payment_year,
  DATEDIFF(NOW(), updated_at) as days_overdue
FROM users
WHERE payment_status = 'unpaid'
  AND is_active = true
ORDER BY days_overdue DESC
```

## Reminder System

### Reminder Schedule
1. **1 month before season**: "Time to renew for 2025 season"
2. **1 week before season**: "Season starts soon, please renew"
3. **Season start**: "Season started, payment pending"
4. **2 weeks after start**: "Friendly reminder: payment outstanding"

### Reminder Template
```
Subject: Lidmaatschap Vernieuwing 2025

Beste [Name],

Het nieuwe seizoen start binnenkort! 

Gelieve je lidmaatschap te vernieuwen:
- Bedrag: €50
- Rekeningnummer: BE12 3456 7890 1234
- Mededeling: Lidmaatschap 2025 - [Name]

Tot binnenkort op de weg!

Het Bestuur
```

## Best Practices

### Data Privacy
1. Store only necessary payment info
2. Don't store full bank details
3. Secure payment records
4. GDPR compliance for financial data

### Accuracy
1. Verify payment amounts
2. Double-check payment year
3. Keep audit trail
4. Reconcile regularly with bank statements

### Communication
1. Clear payment instructions
2. Timely reminders
3. Payment confirmations
4. Outstanding payment notifications

### Reporting
1. Monthly payment status review
2. Quarterly revenue reports
3. Annual financial summary
4. Board meeting updates

## Integration Points

- Email service for reminders
- Database for payment records
- Banking integration (future)
- Accounting software (future)
- Member dashboard (display status)

## Error Handling

### Common Issues
- **Duplicate payment**: Mark as paid once, note double payment
- **Wrong amount**: Contact member, process as partial or refund
- **Missing payment info**: Mark as unverified, contact member
- **System error**: Rollback transaction, retry, log issue

### Resolution Process
1. Identify issue
2. Contact member if needed
3. Correct in database
4. Log correction
5. Send confirmation
6. Update audit trail
