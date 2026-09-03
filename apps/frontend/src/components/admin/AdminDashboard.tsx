import { useMemo, useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EventDto } from '@repo/schemas/events';
import type { UserDto } from '@repo/schemas/users';
import { CalendarDays, Eye, Pencil, Search, Trash2, Users } from 'lucide-react';

import * as m from '@/@generated/paraglide/messages';
import { useTRPC } from '@/integrations/trpc/react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { EventCategoryCombobox } from '@/components/events/EventCategoryCombobox';
import { EventDatePicker } from '@/components/events/EventDatePicker';
import { EventImagePicker } from '@/components/events/EventImagePicker';

type UserDialog = { mode: 'view' | 'edit'; user: UserDto } | null;
type DeleteTarget = { kind: 'user'; item: UserDto } | { kind: 'event'; item: EventDto } | null;

export function AdminDashboard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [userSearch, setUserSearch] = useState('');
  const [eventSearch, setEventSearch] = useState('');
  const [userDialog, setUserDialog] = useState<UserDialog>(null);
  const [eventDialog, setEventDialog] = useState<EventDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const usersQuery = useQuery(trpc.users.getUsers.queryOptions());
  const eventsQuery = useQuery(trpc.events.getEvents.queryOptions('newest'));

  const updateUser = useMutation(
    trpc.users.adminUpdateUser.mutationOptions({
      onSuccess: async () => {
        setUserDialog(null);
        await queryClient.invalidateQueries({ queryKey: trpc.users.getUsers.queryKey() });
      },
    }),
  );
  const deleteUser = useMutation(
    trpc.users.deleteUser.mutationOptions({
      onSuccess: async () => {
        setDeleteTarget(null);
        await queryClient.invalidateQueries({ queryKey: trpc.users.getUsers.queryKey() });
      },
    }),
  );
  const updateEvent = useMutation(
    trpc.eventCreation.updateEvent.mutationOptions({
      onSuccess: async () => {
        setEventDialog(null);
        await queryClient.invalidateQueries({ queryKey: trpc.events.getEvents.queryKey() });
      },
    }),
  );
  const deleteEvent = useMutation(
    trpc.eventCreation.deleteEvent.mutationOptions({
      onSuccess: async () => {
        setDeleteTarget(null);
        await queryClient.invalidateQueries({ queryKey: trpc.events.getEvents.queryKey() });
      },
    }),
  );

  const users = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    return (usersQuery.data ?? []).filter((user) =>
      [user.name, user.username, user.email].some((value) => value.toLowerCase().includes(query)),
    );
  }, [userSearch, usersQuery.data]);

  const events = useMemo(() => {
    const query = eventSearch.trim().toLowerCase();
    return (eventsQuery.data ?? []).filter((event) =>
      [event.title, event.location, event.address, ...event.category].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [eventSearch, eventsQuery.data]);

  const mutationError =
    updateUser.error ?? deleteUser.error ?? updateEvent.error ?? deleteEvent.error;

  function submitUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userDialog || userDialog.mode !== 'edit') return;
    const data = new FormData(event.currentTarget);
    updateUser.mutate({
      id: userDialog.user.id,
      name: formString(data, 'name'),
      username: formString(data, 'username'),
      email: formString(data, 'email'),
      role: data.get('adminRole') === 'on' ? 'admin' : 'user',
    });
  }

  function submitEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!eventDialog) return;
    const data = new FormData(event.currentTarget);
    updateEvent.mutate({
      id: eventDialog.id,
      title: formString(data, 'title'),
      description: formString(data, 'description'),
      category: formString(data, 'category')
        .split(',')
        .map((category) => category.trim())
        .filter(Boolean),
      location: formString(data, 'location'),
      address: formString(data, 'address'),
      date: formString(data, 'date'),
      time: formString(data, 'time'),
      image: formString(data, 'image'),
      maxCapacity: Number(data.get('maxCapacity')),
    });
  }

  function confirmDelete() {
    if (deleteTarget?.kind === 'user') {
      deleteUser.mutate({ id: deleteTarget.item.id });
    } else if (deleteTarget?.kind === 'event') {
      deleteEvent.mutate({ id: deleteTarget.item.id });
    }
  }

  if (usersQuery.isPending || eventsQuery.isPending) {
    return <Spinner className="mx-auto my-24" />;
  }

  const queryError = usersQuery.error ?? eventsQuery.error;
  if (queryError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{queryError.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{m.admin_title()}</h1>
        <p className="text-muted-foreground">{m.admin_subtitle()}</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardDescription>{m.admin_users()}</CardDescription>
            <CardTitle className="flex items-center justify-between text-2xl">
              {usersQuery.data?.length ?? 0}
              <Users className="size-5 text-primary" />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>{m.admin_events()}</CardDescription>
            <CardTitle className="flex items-center justify-between text-2xl">
              {eventsQuery.data?.length ?? 0}
              <CalendarDays className="size-5 text-primary" />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {mutationError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{mutationError.message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">{m.admin_users()}</TabsTrigger>
          <TabsTrigger value="events">{m.admin_events()}</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>{m.admin_manage_users()}</CardTitle>
              <CardDescription>{m.admin_manage_users_description()}</CardDescription>
              <SearchInput
                value={userSearch}
                onChange={setUserSearch}
                label={m.admin_search_users()}
              />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{m.admin_name()}</TableHead>
                    <TableHead>{m.admin_email()}</TableHead>
                    <TableHead>{m.admin_role()}</TableHead>
                    <TableHead className="text-right">{m.admin_actions()}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">@{user.username}</div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={hasAdminRole(user) ? 'default' : 'secondary'}>
                          {hasAdminRole(user) ? m.admin_administrator() : m.admin_registered_user()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <ActionButton
                            label={m.admin_view()}
                            icon={<Eye />}
                            onClick={() => setUserDialog({ mode: 'view', user })}
                          />
                          <ActionButton
                            label={m.admin_edit()}
                            icon={<Pencil />}
                            onClick={() => setUserDialog({ mode: 'edit', user })}
                          />
                          <ActionButton
                            destructive
                            label={m.admin_delete()}
                            icon={<Trash2 />}
                            onClick={() => setDeleteTarget({ kind: 'user', item: user })}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {users.length === 0 && <EmptySearch />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>{m.admin_manage_events()}</CardTitle>
              <CardDescription>{m.admin_manage_events_description()}</CardDescription>
              <SearchInput
                value={eventSearch}
                onChange={setEventSearch}
                label={m.admin_search_events()}
              />
            </CardHeader>
            <CardContent>
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
                            onClick={() => setEventDialog(event)}
                          />
                          <ActionButton
                            destructive
                            label={m.admin_delete()}
                            icon={<Trash2 />}
                            onClick={() => setDeleteTarget({ kind: 'event', item: event })}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {events.length === 0 && <EmptySearch />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <UserDialog
        dialog={userDialog}
        pending={updateUser.isPending}
        onClose={() => setUserDialog(null)}
        onSubmit={submitUser}
      />
      <EventDialog
        event={eventDialog}
        pending={updateEvent.isPending}
        onClose={() => setEventDialog(null)}
        onSubmit={submitEvent}
      />
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{m.admin_confirm_delete()}</AlertDialogTitle>
            <AlertDialogDescription>
              {m.admin_delete_description({
                name:
                  deleteTarget?.kind === 'user'
                    ? deleteTarget.item.name
                    : (deleteTarget?.item.title ?? ''),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{m.admin_cancel()}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteUser.isPending || deleteEvent.isPending}
              onClick={confirmDelete}
            >
              {m.admin_delete()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SearchInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <div className="relative mt-4 max-w-md">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        aria-label={label}
        className="pl-9"
      />
    </div>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
  destructive = false,
}: {
  label: string;
  icon: React.ReactNode;
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

function EmptySearch() {
  return <p className="py-10 text-center text-muted-foreground">{m.admin_no_results()}</p>;
}

function formString(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === 'string' ? value : '';
}

function hasAdminRole(user: UserDto): boolean {
  return user.role.split(',').includes('admin');
}

function UserDialog({
  dialog,
  pending,
  onClose,
  onSubmit,
}: {
  dialog: UserDialog;
  pending: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const user = dialog?.user;
  const editing = dialog?.mode === 'edit';
  return (
    <Dialog open={dialog !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? m.admin_edit_user() : m.admin_user_details()}</DialogTitle>
          <DialogDescription>{user?.email}</DialogDescription>
        </DialogHeader>
        {user && editing ? (
          <form key={user.id} onSubmit={onSubmit} className="space-y-4">
            <FormField label={m.admin_name()} name="name" defaultValue={user.name} />
            <FormField label={m.admin_username()} name="username" defaultValue={user.username} />
            <FormField
              label={m.admin_email()}
              name="email"
              type="email"
              defaultValue={user.email}
            />
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="adminRole">{m.admin_administrator()}</Label>
              <Switch id="adminRole" name="adminRole" defaultChecked={hasAdminRole(user)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {m.admin_cancel()}
              </Button>
              <Button type="submit" disabled={pending}>
                {pending && <Spinner />}
                {m.admin_save()}
              </Button>
            </DialogFooter>
          </form>
        ) : user ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3">
            <dt className="text-muted-foreground">{m.admin_name()}</dt>
            <dd>{user.name}</dd>
            <dt className="text-muted-foreground">{m.admin_username()}</dt>
            <dd>@{user.username}</dd>
            <dt className="text-muted-foreground">{m.admin_email()}</dt>
            <dd>{user.email}</dd>
            <dt className="text-muted-foreground">{m.admin_role()}</dt>
            <dd>{hasAdminRole(user) ? m.admin_administrator() : m.admin_registered_user()}</dd>
            <dt className="text-muted-foreground">{m.admin_joined()}</dt>
            <dd>{user.createdAt.toLocaleDateString()}</dd>
          </dl>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function EventDialog({
  event,
  pending,
  onClose,
  onSubmit,
}: {
  event: EventDto | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
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
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [categories, setCategories] = useState(event.category);
  const [date, setDate] = useState(event.date);
  const [image, setImage] = useState(event.image);

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <FormField
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
        <Label htmlFor="admin-category">{m.admin_categories()}</Label>
        <EventCategoryCombobox
          id="admin-category"
          value={categories}
          onValueChange={setCategories}
        />
        <input type="hidden" name="category" value={categories.join(',')} required />
      </div>
      <FormField label={m.admin_location()} name="location" defaultValue={event.location} />
      <FormField label={m.admin_address()} name="address" defaultValue={event.address} />
      <div className="space-y-2">
        <Label htmlFor="admin-date">{m.admin_date()}</Label>
        <EventDatePicker id="admin-date" name="date" value={date} onValueChange={setDate} />
      </div>
      <FormField label={m.admin_time()} name="time" type="time" defaultValue={event.time} />
      <FormField
        label={m.admin_capacity()}
        name="maxCapacity"
        type="number"
        min={1}
        defaultValue={event.maxCapacity}
      />
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="admin-image">{m.admin_image()}</Label>
        <EventImagePicker id="admin-image" name="image" value={image} onValueChange={setImage} />
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

function FormField({
  label,
  name,
  className,
  ...props
}: { label: string; name: string; className?: string } & React.ComponentProps<typeof Input>) {
  const id = `admin-${name}`;
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} required {...props} />
    </div>
  );
}
