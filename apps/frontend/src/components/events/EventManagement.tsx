// Shared event-management building blocks.
// Used by the admin dashboard (every event) and by /my-events (only the
// events the signed-in user organizes). The backend re-checks ownership on
// eventCreation.updateEvent and eventCreation.deleteEvent, so these
// components never decide who is allowed to manage what.

import { useState, type ComponentProps, type FormEvent, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import type { EventDto } from '@repo/schemas/events';
import { Eye, Pencil, Trash2 } from 'lucide-react';

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
  onEdit,
  onDelete,
}: {
  events: EventDto[];
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
                    {category}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              {event.date} · {event.time}
            </TableCell>
            <TableCell>{event.location}</TableCell>
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
