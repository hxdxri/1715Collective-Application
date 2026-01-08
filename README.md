1715 Collective Brand Application

Purpose
- Collect brand applications cleanly and quickly
- Store submissions and show confirmation message
- Trigger internal follow-up (email and payment later)

User Flow
- Land on application page
- See clear intro + estimated time (3 to 5 minutes)
- Complete a single multi-step form (7 sections) with progress indicator
- Submit
- See confirmation message
- Receive auto-confirmation email with same wording

Form Structure
- Multi-step form, one section per screen (7 sections)
- Sticky progress bar (Section 1 to 7)
- Back and Next buttons
- Save form state locally (localStorage) in case of refresh
- Mobile-first design

Section 1: Brand Information
Fields
- Brand name (text, required, min 2 chars)
- Website or Instagram (url or text, required, url or Instagram handle)
- Country / City (text, optional)
- Year established (number, optional, 4 digits)
- Primary contact name (text, optional)
- Contact email (email, required, valid format)

UX
- Auto-detect if input starts with @ and treat as Instagram
- Inline validation (no full-page errors)

Section 2: Brand Identity and Alignment
Brand category (checkbox, multi-select)
- Streetwear
- Jewelry / Accessories
- Lifestyle
- Art / Design
- Other (reveals text input)

Text areas
- Brief brand description (required, soft limit about 500 chars)
- What makes your brand distinct? (required, 300 to 500 chars)
- Why do you want to be part of The 1715 Collective? (required, 300 to 500 chars)

UX
- Character counter
- Placeholder examples (hidden after typing)

Section 3: Products and Showcase
Fields
- Products to be showcased (textarea, required)
- Average price range (text or select, required, example $40 to $120)
- Approx. number of SKUs (number, required, numeric stepper)

Section 4: Participation and Logistics
Attendance (radio)
- Yes
- Possibly
- No (interested in remote participation)

Requirements (checkboxes)
- Table
- Clothing rack
- Power access
- Wall space
- None / Other (reveals text input)

Static notice (non-dismissible)
BRANDS ARE RESPONSIBLE FOR THEIR BRANDING DESIGNS AND SETUP

Section 5: Package Selection
- Package type (radio, single choice)
  - Standard Showcase

Section 6: Promotion and Content
Fields
- Open to pre-event feature (radio yes/no, required)
- Brand Instagram handle (text, required, auto-prepend @ if missing)
- Follower count (number, optional)

UX
- Optional tooltip: follower count is not a selection factor

Section 7: Final Confirmation
Required checkbox
- I acknowledge that The 1715 Collective is curated and that all applications are subject to selection.

Optional
- Additional notes or questions (textarea)

Submission and Confirmation
On submit
- Disable submit button
- Show loading state
- Validate all required fields
- Submit via async request (no page reload)

Confirmation screen (exact wording)
Thank you for applying to The 1715 Collective.
Our team will review submissions and follow up with selected brands regarding next steps, pricing, and participation details.

Email and Admin Requirements
Applicant auto-email
- Triggered immediately after submission
- Subject: The 1715 Collective — Application Received
- Body: same confirmation text

Admin side
- Store submissions in database or CMS
- Admin fields: status (Pending / Selected / Rejected), internal notes
- Export CSV
- Manual follow-up email with payment link

Performance and Accessibility
- Max form completion time under 5 minutes
- Keyboard navigable
- Proper label-for associations
- Error messages inline, not modal
- Works without Instagram login
- Loads under 2 seconds on mobile

Nice to Have
- Auto-save progress
- Progress indicator (Step 3 of 7)
- Optional preview answers before submit
- Success checkmark animation (subtle)

Out of Scope
- No payment at application stage
- No automatic acceptance or rejection
- No public brand listing
- No user accounts
