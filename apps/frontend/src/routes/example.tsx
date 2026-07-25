import { createFileRoute } from '@tanstack/react-router';
import { type FormEvent, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSubscription } from '@trpc/tanstack-react-query';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import { createUserSchema, updateUserSchema, type UserDto } from '@repo/schemas/users';
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
  AlertDialogTrigger,
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { FieldError } from '@/components/ui/field';
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
import { removeById, replaceById, upsertById } from '@/lib/collection-by-id';

export const Route = createFileRoute('/example')({ component: Home });

function Home() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const usersQuery = useQuery(trpc.users.getUsers.queryOptions());
  const createUser = useMutation(
    trpc.users.createUser.mutationOptions({
      onSuccess: (user) => {
        queryClient.setQueryData(trpc.users.getUsers.queryKey(), (users) =>
          upsertById(users, user),
        );
      },
    }),
  );
  useSubscription(
    trpc.users.onUserCreated.subscriptionOptions(undefined, {
      onData: (user) => {
        queryClient.setQueryData(trpc.users.getUsers.queryKey(), (users) => {
          if (!users) {
            return [user];
          }

          return upsertById(users, user);
        });
      },
    }),
  );
  useSubscription(
    trpc.users.onUserUpdated.subscriptionOptions(undefined, {
      onData: (user) => {
        queryClient.setQueryData(trpc.users.getUsers.queryKey(), (users) =>
          replaceById(users, user),
        );
      },
    }),
  );
  useSubscription(
    trpc.users.onUserDeleted.subscriptionOptions(undefined, {
      onData: (user) => {
        queryClient.setQueryData(trpc.users.getUsers.queryKey(), (users) =>
          removeById(users, user.id),
        );
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      username: '',
    },
    validators: {
      onChange: createUserSchema,
    },
    onSubmit: async ({ value }) => {
      await createUser.mutateAsync(value);
      form.reset();
    },
  });

  const users = usersQuery.data ?? [];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          Create a user and keep the local directory in sync.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,24rem)_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create User</CardTitle>
            <CardDescription>Add a name and email address.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void form.handleSubmit();
              }}
              className="flex flex-col gap-4"
            >
              <form.Field
                name="name"
                children={(field) => {
                  const errors = field.state.meta.errors;

                  return (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Name</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={errors.length > 0}
                      />
                      <FieldError errors={errors} />
                    </div>
                  );
                }}
              />

              <form.Field
                name="email"
                children={(field) => {
                  const errors = field.state.meta.errors;

                  return (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Email</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={errors.length > 0}
                      />
                      <FieldError errors={errors} />
                    </div>
                  );
                }}
              />

              {createUser.error ? (
                <Alert variant="destructive">
                  <AlertDescription>{createUser.error.message}</AlertDescription>
                </Alert>
              ) : null}

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={!(canSubmit as boolean) || (isSubmitting as boolean)}
                    className="w-full"
                  >
                    {(isSubmitting as boolean) ? (
                      <>
                        <Spinner />
                        Submitting
                      </>
                    ) : (
                      'Submit'
                    )}
                  </Button>
                )}
              />
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="grid gap-1">
                <CardTitle>Users List</CardTitle>
                <CardDescription>Recently created users.</CardDescription>
              </div>
              <Badge variant="secondary">{users.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {usersQuery.isPending ? (
              <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
                <Spinner />
                Loading users
              </div>
            ) : usersQuery.isError ? (
              <Alert variant="destructive">
                <AlertDescription>{usersQuery.error.message}</AlertDescription>
              </Alert>
            ) : users.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>No users yet</EmptyTitle>
                  <EmptyDescription>Created users will appear here.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <EditUserDialog user={user} />
                          <DeleteUserAlert user={user} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function EditUserDialog({ user }: { user: UserDto }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string }>({});

  const updateUser = useMutation(
    trpc.users.updateUser.mutationOptions({
      onSuccess: (updatedUser) => {
        queryClient.setQueryData(trpc.users.getUsers.queryKey(), (users) =>
          replaceById(users, updatedUser),
        );
        setOpen(false);
      },
    }),
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      setName(user.name);
      setEmail(user.email);
      setFieldErrors({});
      updateUser.reset();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = updateUserSchema.safeParse({
      id: user.id,
      name,
      email,
    });

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;

      setFieldErrors({
        name: errors.name?.join(', '),
        email: errors.email?.join(', '),
      });
      return;
    }

    setFieldErrors({});
    try {
      await updateUser.mutateAsync(result.data);
    } catch {
      // Mutation state renders the error in the dialog.
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <PencilIcon />
        <span className="sr-only">Edit {user.name}</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update this user's name or email address.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`edit-name-${user.id}`}>Name</Label>
            <Input
              id={`edit-name-${user.id}`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={Boolean(fieldErrors.name)}
            />
            <FieldError>{fieldErrors.name}</FieldError>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-email-${user.id}`}>Email</Label>
            <Input
              id={`edit-email-${user.id}`}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
            />
            <FieldError>{fieldErrors.email}</FieldError>
          </div>

          {updateUser.error ? (
            <Alert variant="destructive">
              <AlertDescription>{updateUser.error.message}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={updateUser.isPending}>
              {updateUser.isPending ? (
                <>
                  <Spinner />
                  Saving
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteUserAlert({ user }: { user: UserDto }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const deleteUser = useMutation(
    trpc.users.deleteUser.mutationOptions({
      onSuccess: (deletedUser) => {
        queryClient.setQueryData(trpc.users.getUsers.queryKey(), (users) =>
          removeById(users, deletedUser.id),
        );
        setOpen(false);
      },
    }),
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      deleteUser.reset();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <Trash2Icon />
        <span className="sr-only">Delete {user.name}</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {user.name} from the users list.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {deleteUser.error ? (
          <Alert variant="destructive">
            <AlertDescription>{deleteUser.error.message}</AlertDescription>
          </Alert>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteUser.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteUser.isPending}
            onClick={() => {
              deleteUser.mutate({ id: user.id });
            }}
          >
            {deleteUser.isPending ? (
              <>
                <Spinner />
                Deleting
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
