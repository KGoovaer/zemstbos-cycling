# 032 - Payment Tracking

**Epic:** Admin Features
**Priority:** Must
**Estimated Effort:** 4 hours
**Phase:** 3

## User Story

As an **admin**
I want **to update member payment status**
So that **I can track who has paid their annual membership fee**

## Description

Simple interface for admins to mark members as paid/unpaid for the current season and track payment year.

## Acceptance Criteria

- [ ] View all members with payment status
- [ ] Quick toggle to mark as paid/unpaid
- [ ] Set payment year
- [ ] Filter by payment status
- [ ] Export payment report
- [ ] Bulk update for multiple members

## Technical Implementation

### Database Changes
None (uses paymentStatus and paymentYear fields)

### API Endpoints
- `PUT /api/admin/members/[id]/payment` - Update payment status

### Components/Pages
- `/app/(admin)/admin/payments/page.tsx` - Payment tracking page
- `/components/admin/PaymentTable.tsx` - Members with payment status

## Dependencies

- **Depends on:** 031 - Member Management

## UI/UX Notes

- Quick toggle switches for payment status
- Color-coded: green (paid), yellow (unpaid), gray (exempt)
- Bulk selection for mass updates

## Testing Considerations

- [ ] Payment toggle works
- [ ] Year update works
- [ ] Filters work correctly
- [ ] Export includes all fields

## Notes

- **Payment Year:** Track which season was paid
- **Exempt Status:** For honorary members
