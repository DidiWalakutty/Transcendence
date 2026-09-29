import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EventDto } from '@repo/schemas/events';
import type { UserDto } from '@repo/schemas/users';
import { hasAdminRole } from '@repo/schemas/users';
import { CalendarDays, Eye, Pencil, Trash2, Users } from 'lucide-react';

import * as m from '@/@generated/paraglide/messages';
import { useTRPC } from '@/integrations/trpc/react';
import { useEventStream } from '@/hooks/use-event-stream';
import { useUserStream } from '@/hooks/use-user-stream';
import { filterByFields } from '@/lib/search';
import { EmptyResults, SearchInput } from '@/components/ui/search-input';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  ActionButton,
  EventEditDialog,
  EventAttendeeDialog,
  EventManagementTable,
  FormField,
  eventFormToUpdateInput,
  userFormToAdminUpdateInput,
} from '@/components/events/EventManagement';

type UserDialog = { mode: 'view' | 'edit'; user: UserDto } | null;
type DeleteTarget = { kind: 'user'; item: UserDto } | { kind: 'event'; item: EventDto } | null;

export function AdminDashboard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [userSearch, setUserSearch] = useState('');
  const [eventSearch, setEventSearch] = useState('');
  const [userDialog, setUserDialog] = useState<UserDialog>(null);
  const [eventDialog, setEventDialog] = useState<EventDto | null>(null);
  const [attendeeTarget, setAttendeeTarget] = useState<EventDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  // Both tables follow the backend's own broadcasts, so a change made by
  // another administrator, or by an organizer on their own event, lands here
  // without a refetch.
  useUserStream();
  useEventStream();

  const usersQuery = useQuery(trpc.users.getUsers.queryOptions());
  const eventsQuery = useQuery(trpc.eventCreation.getAllEventsWithCounts.queryOptions());

  const attendeeDetailQuery = useQuery({
    ...trpc.registrations.getEventAttendees.queryOptions(
      { id: attendeeTarget?.id ?? '' },
      { enabled: !!attendeeTarget },
    ),
  });

  const attendeeCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const event of eventsQuery.data ?? []) {
      counts.set(event.id, event.attendeeCount);
    }

    return counts;
  }, [eventsQuery.data]);

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

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.events.getEvents.queryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.eventCreation.getAllEventsWithCounts.queryKey(),
          }),
        ]);
      },
    }),
  );
  const deleteEvent = useMutation(
    trpc.eventCreation.deleteEvent.mutationOptions({
      onSuccess: async () => {
        setDeleteTarget(null);

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.events.getEvents.queryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.eventCreation.getAllEventsWithCounts.queryKey(),
          }),
        ]);
      },
    }),
  );

  const users = useMemo(
    () =>
      filterByFields(usersQuery.data ?? [], userSearch, (user) => [
        user.name,
        user.username,
        user.email,
      ]),
    [userSearch, usersQuery.data],
  );

  const events = useMemo(
    () =>
      filterByFields(eventsQuery.data ?? [], eventSearch, (event) => [
        event.title,
        event.location,
        event.address,
        ...event.category,
      ]),
    [eventSearch, eventsQuery.data],
  );

  const mutationError =
    updateUser.error ?? deleteUser.error ?? updateEvent.error ?? deleteEvent.error;

  function submitUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userDialog || userDialog.mode !== 'edit') return;
    const data = new FormData(event.currentTarget);
    updateUser.mutate(userFormToAdminUpdateInput(userDialog.user.id, data));
  }

  function submitEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!eventDialog) return;
    const data = new FormData(event.currentTarget);
    updateEvent.mutate(eventFormToUpdateInput(eventDialog.id, data));
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
                placeholder={m.admin_search_users()}
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
                          {!hasAdminRole(user) && (
                            <ActionButton
                              destructive
                              label={m.admin_delete()}
                              icon={<Trash2 />}
                              onClick={() => setDeleteTarget({ kind: 'user', item: user })}
                            />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {users.length === 0 && <EmptyResults message={m.admin_no_results()} />}
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
                placeholder={m.admin_search_events()}
              />
            </CardHeader>
            <CardContent>
              <EventManagementTable
                events={events}
                attendeeCounts={attendeeCounts}
                onAttendees={setAttendeeTarget}
                onEdit={setEventDialog}
                onDelete={(event) => setDeleteTarget({ kind: 'event', item: event })}
              />
              {events.length === 0 && <EmptyResults message={m.admin_no_results()} />}
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
      <EventAttendeeDialog
        event={attendeeTarget}
        attendees={attendeeDetailQuery.data ?? []}
        onClose={() => setAttendeeTarget(null)}
      />
      <EventEditDialog
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
            <FormField
              idPrefix="admin"
              label={m.admin_name()}
              name="name"
              defaultValue={user.name}
            />
            <FormField
              idPrefix="admin"
              label={m.admin_username()}
              name="username"
              defaultValue={user.username}
            />
            <FormField
              idPrefix="admin"
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
