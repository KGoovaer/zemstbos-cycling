# 034 - GPX Upload

**Epic:** Admin Features
**Priority:** Must
**Estimated Effort:** 8 hours
**Phase:** 3

## User Story

As an **admin**
I want **to upload GPX files and automatically extract route information**
So that **I can quickly add new routes to the library**

## Description

Upload GPX files with automatic parsing to extract distance, elevation, and track points. Admin can review and edit metadata before saving.

## Acceptance Criteria

- [ ] File upload interface accepts .gpx files
- [ ] GPX parsed automatically on upload
- [ ] Distance calculated from track points
- [ ] Elevation gain calculated
- [ ] Route name extracted from GPX or editable
- [ ] Admin can set difficulty, start location, region
- [ ] Preview map before saving
- [ ] Validation for required fields

## Technical Implementation

### Database Changes
None

### API Endpoints
- `POST /api/admin/routes/upload` - Upload and parse GPX

### Components/Pages
- `/app/(admin)/admin/routes/upload/page.tsx` - Upload page
- `/components/admin/GPXUploadForm.tsx` - Upload form
- `/components/admin/RoutePreview.tsx` - Preview before saving

### Libraries/Dependencies
```json
{
  "gpxparser": "^3.0.0"
}
```

## Dependencies

- **Depends on:** 033 - Route Library

## UI/UX Notes

- Drag-and-drop file upload
- Progress indicator during parsing
- Clear preview of extracted data
- Large save button

## Testing Considerations

- [ ] GPX file uploads successfully
- [ ] Distance calculated correctly
- [ ] Elevation calculated correctly
- [ ] Preview map displays
- [ ] Save creates route in database
- [ ] Handles invalid GPX files

## Notes

- **File Size:** Limit GPX uploads to reasonable size (< 5MB)
- **Validation:** Ensure GPX has valid track points
