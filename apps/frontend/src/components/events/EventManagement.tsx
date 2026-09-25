// Shared event-management building blocks.
// Used by the admin dashboard (every event) and by /my-events (only the
// events the signed-in user organizes). The backend re-checks ownership on
// eventCreation.updateEvent and eventCreation.deleteEvent, so these
// components never decide who is allowed to manage what.

import { useState, type ComponentProps, type FormEvent, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import type { EventDto } from '@repo/schemas/events';
import type { EventAttendeeDto } from '@repo/schemas/registrations';
import { Eye, Pencil, Trash2, Users } from 'lucide-react';

import * as m from '@/@generated/paraglide/messages';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { EventCategoryCombobox } from '@/components/events/EventCategoryCombobox';
import { EventDatePicker } from '@/components/events/EventDatePicker';
import { EventImagePicker } from '@/components/events/EventImagePicker';
import { getCategoryLabel } from '@/lib/categories';

export function ActionButton({
  label,
  icon,
  onClick,
  destructive = false,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <Button
      type="button"
      variant={destructive ? 'destructive' : 'ghost'}
      size="icon-sm"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {icon}
    </Button>
  );
}

export function FormField({
  label,
  name,
  idPrefix = 'field',
  className,
  ...props
}: { label: string; name: string; idPrefix?: string; className?: string } & ComponentProps<
  typeof Input
>) {
  const id = `${idPrefix}-${name}`;
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} required {...props} />
    </div>
  );
}

export function EventManagementTable({
  events,
  attendeeCounts,
  onAttendees,
  onEdit,
  onDelete,
}: {
  events: EventDto[];
  attendeeCounts?: Map<string, number>;
  onAttendees?: (event: EventDto) => void;
  onEdit: (event: EventDto) => void;
  onDelete: (event: EventDto) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{m.admin_event()}</TableHead>
          <TableHead>{m.admin_date()}</TableHead>
          <TableHead>{m.admin_location()}</TableHead>
          {attendeeCounts && <TableHead>{m.admin_attendees()}</TableHead>}
          <TableHead className="text-right">{m.admin_actions()}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.id}>
            <TableCell>
              <div className="font-medium">{event.title}</div>
              <div className="flex gap-1 pt-1">
                {event.category.slice(0, 2).map((category) => (
                  <Badge key={category} variant="outline">
                    {getCategoryLabel(category)}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              {event.date} · {event.time}
            </TableCell>
            <TableCell>{event.location}</TableCell>

            {attendeeCounts && (
              <TableCell>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto gap-2 px-2"
                  onClick={() => onAttendees?.(event)}
                >
                  <Users className="size-4 text-muted-foreground" />
                  <span>
                    {attendeeCounts.get(event.id) ?? 0}/{event.maxCapacity}
                  </span>
                </Button>
              </TableCell>
            )}

            <TableCell>
              <div className="flex justify-end gap-1">
                <Link
                  to="/events/$eventId"
                  params={{ eventId: event.id }}
                  className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
                  aria-label={m.admin_view()}
                  title={m.admin_view()}
                >
                  <Eye />
                </Link>
                <ActionButton
                  label={m.admin_edit()}
                  icon={<Pencil />}
                  onClick={() => onEdit(event)}
                />
                <ActionButton
                  destructive
                  label={m.admin_delete()}
                  icon={<Trash2 />}
                  onClick={() => onDelete(event)}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function EventEditDialog({
  event,
  pending,
  onClose,
  onSubmit,
}: {
  event: EventDto | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (submitEvent: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Dialog open={event !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{m.admin_edit_event()}</DialogTitle>
          <DialogDescription>{m.admin_edit_event_description()}</DialogDescription>
        </DialogHeader>
        {event && (
          <EventEditForm
            key={event.id}
            event={event}
            pending={pending}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function EventEditForm({
  event,
  pending,
  onClose,
  onSubmit,
}: {
  event: EventDto;
  pending: boolean;
  onClose: () => void;
  onSubmit: (submitEvent: FormEvent<HTMLFormElement>) => void;
}) {
  const [categories, setCategories] = useState(event.category);
  const [date, setDate] = useState(event.date);
  const [image, setImage] = useState(event.image);
  const [hasContactInfo, setHasContactInfo] = useState(
    Boolean(event.contactName || event.contactEmail),
  );
  const [contactName, setContactName] = useState(event.contactName || '');
  const [contactEmail, setContactEmail] = useState(event.contactEmail || '');

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <FormField
        idPrefix="event"
        label={m.admin_title_label()}
        name="title"
        defaultValue={event.title}
        className="sm:col-span-2"
      />
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="event-description">{m.admin_description()}</Label>
        <Textarea
          id="event-description"
          name="description"
          required
          defaultValue={event.description}
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="event-category">{m.admin_categories()}</Label>
        <EventCategoryCombobox
          id="event-category"
          value={categories}
          onValueChange={setCategories}
        />
        <input type="hidden" name="category" value={categories.join(',')} required />
      </div>
      <FormField
        idPrefix="event"
        label={m.admin_location()}
        name="location"
        defaultValue={event.location}
      />
      <FormField
        idPrefix="event"
        label={m.admin_address()}
        name="address"
        defaultValue={event.address}
      />
      <div className="space-y-2">
        <Label htmlFor="event-date">{m.admin_date()}</Label>
        <EventDatePicker id="event-date" name="date" value={date} onValueChange={setDate} />
      </div>
      <FormField
        idPrefix="event"
        label={m.admin_time()}
        name="time"
        type="time"
        defaultValue={event.time}
      />
      <FormField
        idPrefix="event"
        label={m.admin_capacity()}
        name="maxCapacity"
        type="number"
        min={1}
        defaultValue={event.maxCapacity}
      />
      <div className="flex flex-col justify-end h-full self-flex-end">
        <div className="flex items-center space-x-2 rounded-lg border border-input p-3 bg-white h-[40px]">
          <input
            type="checkbox"
            id="edit-hasContactInfo"
            checked={hasContactInfo}
            onChange={(e) => {
              const isChecked = e.target.checked;
              setHasContactInfo(isChecked);
              if (!isChecked) {
                setContactName('');
                setContactEmail('');
              }
            }}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label
            htmlFor="edit-hasContactInfo"
            className="text-sm font-medium text-gray-700 select-none cursor-pointer"
          >
            {m.event_contact_include()}
          </label>
        </div>
      </div>
      {hasContactInfo && (
        <div className="grid gap-4 grid-cols-2 sm:col-span-2 p-4 rounded-lg bg-gray-50 border border-input">
          <div className="space-y-2 col-span-1">
            <Label htmlFor="edit-contactName">{m.event_contact_name_label()}</Label>
            <Input
              id="edit-contactName"
              name="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder={m.event_contact_name_placeholder()}
              className="bg-white"
            />
          </div>
          <div className="space-y-2 col-span-1">
            <Label htmlFor="edit-contactEmail">{m.event_contact_email_label()}</Label>
            <Input
              id="edit-contactEmail"
              name="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="organizer@example.com"
              className="bg-white"
            />
          </div>
        </div>
      )}
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="event-image">{m.admin_image()}</Label>
        <EventImagePicker id="event-image" name="image" value={image} onValueChange={setImage} />
      </div>
      <DialogFooter className="sm:col-span-2">
        <Button type="button" variant="outline" onClick={onClose}>
          {m.admin_cancel()}
        </Button>
        <Button type="submit" disabled={pending || categories.length === 0 || !date || !image}>
          {pending && <Spinner />}
          {m.admin_save()}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EventDeleteDialog({
  event,
  pending,
  onCancel,
  onConfirm,
}: {
  event: EventDto | null;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={event !== null} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{m.admin_confirm_delete()}</AlertDialogTitle>
          <AlertDialogDescription>
            {m.admin_delete_description({ name: event?.title ?? '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{m.admin_cancel()}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={pending} onClick={onConfirm}>
            {m.admin_delete()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function EventAttendeeDialog({
  event,
  attendees,
  onClose,
}: {
  event: EventDto | null;
  attendees: EventAttendeeDto[];
  onClose: () => void;
}) {
  return (
    <Dialog open={event !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.admin_attendees()}</DialogTitle>
          <DialogDescription>
            {event ? `${attendees.length}/${event.maxCapacity}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto">
          {attendees.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">{m.admin_no_results()}</p>
          ) : (
            <div className="space-y-2">
              {attendees.map((attendee) => (
                <div
                  key={attendee.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <span className="font-medium">{attendee.name}</span>
                  <span className="text-muted-foreground">@{attendee.username}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Reads a form value as a string, so callers can build mutation input from FormData.
export function formString(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === 'string' ? value : '';
}

// Turns the comma separated hidden category input back into an array.
export function formCategories(data: FormData): string[] {
  return formString(data, 'category')
    .split(',')
    .map((category) => category.trim())
    .filter(Boolean);
}

export function eventFormToUpdateInput(
  id: string,
  data: FormData,
): import('@repo/schemas/events').UpdateEventDto {
  const contactNameStr = formString(data, 'contactName').trim();
  const contactEmailStr = formString(data, 'contactEmail').trim();

  return {
    id,
    title: formString(data, 'title'),
    description: formString(data, 'description'),
    category: formCategories(data) as import('@repo/schemas/events').UpdateEventDto['category'],
    location: formString(data, 'location'),
    address: formString(data, 'address'),
    date: formString(data, 'date'),
    time: formString(data, 'time'),
    image: formString(data, 'image'),
    maxCapacity: Number(data.get('maxCapacity')),
    contactName: contactNameStr || null,
    contactEmail: contactEmailStr || null,
  };
}

export function userFormToAdminUpdateInput(
  id: string,
  data: FormData,
): { id: string; name: string; username: string; email: string; role: 'user' | 'admin' } {
  return {
    id,
    name: formString(data, 'name'),
    username: formString(data, 'username'),
    email: formString(data, 'email'),
    role: data.get('adminRole') === 'on' ? 'admin' : 'user',
  };
}

export function TicketManagementTable({
  tickets,
  onCancel,
}: {
  tickets: EventDto[];
  onCancel: (ticket: EventDto) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{m.my_tickets_table_event()}</TableHead>
          <TableHead>{m.my_tickets_table_date()}</TableHead>
          <TableHead>{m.my_tickets_table_location()}</TableHead>
          <TableHead className="text-right">{m.my_tickets_table_actions()}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((ticket) => (
          <TableRow key={ticket.id}>
            <TableCell>
              <div className="font-medium">{ticket.title}</div>
              <div className="flex gap-1 pt-1">
                {ticket.category.slice(0, 2).map((category) => (
                  <Badge key={category} variant="outline">
                    {getCategoryLabel(category)}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              {ticket.date} · {ticket.time}
            </TableCell>
            <TableCell>{ticket.location}</TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Link
                  to="/events/$eventId"
                  params={{ eventId: ticket.id }}
                  className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
                  aria-label={m.my_tickets_action_view()}
                  title={m.my_tickets_action_view()}
                >
                  <Eye />
                </Link>
                <ActionButton
                  destructive
                  label={m.my_tickets_cancel_action()}
                  icon={<Trash2 />}
                  onClick={() => onCancel(ticket)}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function TicketCancelDialog({
  ticket,
  pending,
  onCancel,
  onConfirm,
}: {
  ticket: EventDto | null;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={ticket !== null} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{m.my_tickets_cancel_title()}</AlertDialogTitle>
          <AlertDialogDescription>
            {m.my_tickets_cancel_description({ name: ticket?.title ?? '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{m.my_tickets_cancel_abort()}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={pending} onClick={onConfirm}>
            {pending ? <Spinner /> : m.my_tickets_cancel_confirm()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
