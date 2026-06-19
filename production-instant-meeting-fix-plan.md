# Instant meeting end-to-end fix plan

Goal: make Dashboard “Start Instant Meeting” → Room join → Socket events real.

## Current issues
1) Dashboard creates meeting with `participants: ["me"]` and `host: "me"`.
   - Backend expects real user ObjectId(s) for participants; it overwrites host server-side.
2) Room page joins socket with `roomId: id` (Mongo meeting _id from route params).
   - Socket.io server expects socket room name to be `meeting:${meeting.roomId}`.
3) Room UI uses mock data for participants/transcript/AI insights.

## Fix sequence
### 1) Backend: add instant meeting endpoint (host-only)
- Add route: `POST /api/meetings/instant`
- Server:
  - Creates Meeting with:
    - `host = req.user._id`
    - `participants = [req.user._id]`
    - `roomId = generated`
    - `status = live`
    - `start = now`
- Return:
  - meeting `_id` (Mongo id)
  - `roomId` (socket room id)

### 2) Frontend: Dashboard startInstant
- Replace the current `meetingService.create(...)` with `meetingService.startInstant(...)`.
- Navigate to `/app/room/$id` using `meeting._id`.

### 3) Frontend: Room join + controls wiring
- On room mount:
  - fetch meeting by Mongo id (route `$id`)
  - join socket using `meeting.roomId` (not the Mongo `_id`)
- Replace mock transcript/participants/AI insights for this path:
  - transcript: call `GET /api/meetings/:id/transcripts`
  - participants: use meeting participants (ideally populated server-side or fetched)

## Files to change (first iteration)
- Backend/src/routes/domain.routes.ts (or new route module)
- Backend/src/app.ts (mount new route if needed)
- Frontend/src/lib/api/services.ts (add `startInstant`)
- Frontend/src/routes/app.dashboard.tsx (use `startInstant`)
- Frontend/src/routes/app.room.$id.tsx (join socket with `meeting.roomId`, remove mock wiring on participants/transcript)

## Implementation status
- ✅ Dashboard now calls `meetingService.startInstant(...)` and navigates using `created.meetingId` (code edited).
- ❌ `meetingService.startInstant` does not exist yet (must be implemented).
- ❌ Backend `/api/meetings/instant` endpoint does not exist yet (must be implemented).
- ❌ Room page still joins socket with Mongo `_id` and uses mocks; must be fixed after backend + service exist.
