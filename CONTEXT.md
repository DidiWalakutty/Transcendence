# ft_transcendence

An event platform: organizers publish events with a fixed capacity, and users register for them.
Users can befriend each other and see who is online.

## Language

### Events

**Event**:
Something an Organizer publishes for others to attend. Has a title, a date, and a Max Capacity.
_Avoid_: Spectacle, listing (when you mean the thing itself)

**Organizer**:
The User who created an Event and is the only one allowed to edit it or see its Attendees.
_Avoid_: Owner, creator, author

**Max Capacity**:
The total number of Tickets an Event has.
_Avoid_: Seats, slots

**Event Listing**:
A read-only view of Events for browsing: sorted, featured, or filtered per user. Never edited
directly; it reflects Events.
_Avoid_: Catalogue, feed

**Featured Event**:
An Event chosen to be highlighted on the landing page.

### Registrations

**Ticket**:
One of an Event's Max Capacity spots. A Ticket is held by an active Registration or is Available.
"My Tickets" are the Tickets a User currently holds.
_Avoid_: Seat, slot, spot

**Registration**:
The link between one User and one Event that holds one Ticket while active. Either active or
canceled; a User has at most one active Registration per Event.
_Avoid_: Booking, sign-up, enrolment

**Available Tickets**:
The Event's Tickets not held by an active Registration. Zero means the Event is Sold Out.

**Sold Out**:
An Event with no Available Tickets. Registering fails; a Cancellation makes a Ticket Available again.

**Attendee**:
A User with an active Registration, as seen by the Event's Organizer.
_Avoid_: Participant, guest

**Cancellation**:
Turning an active Registration into a canceled one. The Registration is kept, not deleted.
_Avoid_: Unregister, delete registration

### People

**User**:
An account on the platform, identified by a unique username and email.
_Avoid_: Account, member, player

**Friendship**:
A relationship between two Users. Starts pending when one User sends a Friend Request and becomes
accepted when the other accepts.

**Friend Request**:
A pending Friendship.

**Presence**:
Whether a User is currently online, meaning they hold at least one open connection to the platform.
_Avoid_: Status, activity
