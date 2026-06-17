import { createFileRoute } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createUserSchema } from '@repo/schemas/users';
import { useTRPC } from '@/integrations/trpc/react';

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

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-4">Create User</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="flex flex-col gap-4 max-w-sm mb-8"
      >
        <form.Field
          name="name"
          children={(field) => (
            <div>
              <label htmlFor={field.name} className="block mb-1">
                Name
              </label>
              <input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="border p-2 w-full border-gray-300"
              />
              {field.state.meta.errors.length > 0 && (
                <em role="alert" className="text-red-500 text-sm">
                  {field.state.meta.errors
                    .flatMap((error) => (error ? [error.message] : []))
                    .join(', ')}
                </em>
              )}
            </div>
          )}
        />

        <form.Field
          name="email"
          children={(field) => (
            <div>
              <label htmlFor={field.name} className="block mb-1">
                Email
              </label>
              <input
                id={field.name}
                name={field.name}
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="border p-2 w-full border-gray-300"
              />
              {field.state.meta.errors.length > 0 && (
                <em role="alert" className="text-red-500 text-sm">
                  {field.state.meta.errors
                    .flatMap((error) => (error ? [error.message] : []))
                    .join(', ')}
                </em>
              )}
            </div>
          )}
        />

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit as boolean}
              className="bg-blue-500 text-white p-2 disabled:opacity-50"
            >
              {(isSubmitting as boolean) ? 'Submitting...' : 'Submit'}
            </button>
          )}
        />
      </form>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">Users List</h2>
        {usersQuery.isLoading ? (
          <div>Loading...</div>
        ) : (
          <ul className="list-disc pl-5">
            {usersQuery.data?.map((user, i) => (
              <li key={i}>
                {user.name} ({user.email})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
