---
name: member-management
description: Manage cycling club member operations including registrations, profile updates, membership renewals, status changes, and communications. Use for all member-related administrative tasks.
allowed-tools: Read, Write, Edit, Bash
---

# Member Management Skill

## Purpose

Handle all aspects of cycling club membership lifecycle from registration through renewal, including profile management, status tracking, and member communications.

## Capabilities

### Member Registration
- Process new member applications
- Validate member information
- Create member accounts
- Assign member IDs
- Send welcome communications
- Set up Google OAuth or email/password authentication

### Profile Management
- Update contact information
- Manage emergency contacts
- Handle preference changes
- Track bike/equipment details
- Update medical information
- Manage communication preferences

### Membership Status
- Track active/inactive status
- Handle membership renewals
- Process membership cancellations
- Manage payment status
- Set membership expiration dates
- Handle membership suspensions

### Communications
- Send welcome emails
- Renewal reminders
- Payment confirmations
- Status change notifications
- Important announcements

## Member Lifecycle Stages

### 1. Registration
**Tasks**:
- Collect member information
- Validate email uniqueness
- Create user account
- Set initial password or Google OAuth
- Assign role (member/admin)
- Send welcome email

**Required Fields**:
- First name, last name
- Email (unique)
- Phone number
- Emergency contact
- Birth date (for age groups)

### 2. Active Membership
**Tasks**:
- Update profile as needed
- Track ride participation
- Monitor payment status
- Handle preference changes

**Monitoring**:
- Payment expiration approaching
- Inactivity (no rides in 3 months)
- Profile incomplete

### 3. Renewal
**Tasks**:
- Send renewal reminder (1 month before expiration)
- Process renewal payment
- Update payment_year and payment_status
- Send confirmation

**Timing**:
- First reminder: 1 month before expiration
- Second reminder: 1 week before expiration
- Final reminder: Day of expiration

### 4. Inactive/Cancellation
**Tasks**:
- Set is_active = false (soft delete)
- Preserve historical data
- Stop communications
- Document reason for cancellation

## Data Validation Rules

### Email
- Valid email format
- Unique in database
- Confirmed via verification email

### Phone
- Valid Belgian phone format (+32 xxx xx xx xx)
- Optional but recommended

### Emergency Contact
- Name and phone required
- Relationship to member

### Payment
- Status: paid, unpaid, exempt
- Year: current season
- Expiration date calculated from payment date

## Common Operations

### Create New Member
```typescript
const newMember = await prisma.user.create({
  data: {
    email,
    passwordHash: await bcrypt.hash(password, 10),
    firstName,
    lastName,
    phone,
    role: 'member',
    paymentStatus: 'unpaid',
    isActive: true,
  }
})
```

### Update Member Profile
```typescript
await prisma.user.update({
  where: { id: memberId },
  data: {
    phone: newPhone,
    updatedAt: new Date(),
  }
})
```

### Process Renewal
```typescript
await prisma.user.update({
  where: { id: memberId },
  data: {
    paymentStatus: 'paid',
    paymentYear: new Date().getFullYear(),
  }
})
```

### Deactivate Member
```typescript
await prisma.user.update({
  where: { id: memberId },
  data: {
    isActive: false,
    updatedAt: new Date(),
  }
})
```

## Best Practices

1. **Privacy**: Handle personal data securely, follow GDPR
2. **Validation**: Always validate before saving
3. **Audit Trail**: Log all changes to member records
4. **Communication**: Keep members informed of status changes
5. **Soft Delete**: Never hard-delete members (preserve history)
6. **Confirmation**: Confirm destructive actions
7. **Accessibility**: Ensure member-facing forms are accessible

## Error Handling

### Duplicate Email
```
Error: Email already registered
Action: Suggest password reset or contact admin
```

### Invalid Data
```
Error: Invalid phone number format
Action: Show correct format example
```

### Payment Issues
```
Error: Payment processing failed
Action: Provide alternative payment methods
```

## Reporting

### Member Statistics
- Total active members
- New members this month/year
- Renewal rate
- Payment status breakdown
- Age distribution
- Geographic distribution

### Export Formats
- Excel (member list with contact info)
- CSV (for email campaigns)
- PDF (printable directory)

## Integration Points

- Email service for communications
- Payment gateway for renewals
- Authentication system (NextAuth.js)
- Database (Prisma/PostgreSQL)
