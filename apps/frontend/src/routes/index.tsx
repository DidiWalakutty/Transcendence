import { createFileRoute } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSubscription } from '@trpc/tanstack-react-query';
import { createUserSchema } from '@repo/schemas/users';
import { useTRPC } from '@/integrations/trpc/react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
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

export const Route = createFileRoute('/')({ component: Home });

function Home() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const usersQuery = useQuery(trpc.example.getUsers.queryOptions());
  const createUser = useMutation(
    trpc.example.createUser.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(trpc.example.getUsers.queryFilter());
      },
    }),
  );
  useSubscription(
    trpc.example.onUserCreated.subscriptionOptions(undefined, {
      onData: (user) => {
        queryClient.setQueryData(trpc.example.getUsers.queryKey(), (users) => {
          if (!users) {
            return [user];
          }

          if (users.some((existingUser) => existingUser.id === user.id)) {
            return users;
          }

          return [...users, user];
        });
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
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
                  const errors = field.state.meta.errors
                    .flatMap((error) => (error ? [error.message] : []))
                    .join(', ');

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
                      {errors ? (
                        <p role="alert" className="text-sm text-destructive">
                          {errors}
                        </p>
                      ) : null}
                    </div>
                  );
                }}
              />

              <form.Field
                name="email"
                children={(field) => {
                  const errors = field.state.meta.errors
                    .flatMap((error) => (error ? [error.message] : []))
                    .join(', ');

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
                      {errors ? (
                        <p role="alert" className="text-sm text-destructive">
                          {errors}
                        </p>
                      ) : null}
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
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
