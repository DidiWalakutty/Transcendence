import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { userSchema } from '@repo/schemas'
import { useTRPC } from '@/integrations/trpc/react'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const trpc = useTRPC()
  const utils = trpc.useUtils()
  
  const usersQuery = trpc.example.getUsers.useQuery()
  const createUser = trpc.example.createUser.useMutation({
    onSuccess: () => {
      utils.example.getUsers.invalidate()
    }
  })

  const form = useForm({
    defaultValues: {
      name: '',
      age: 18,
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: userSchema,
    },
    onSubmit: async ({ value }) => {
      await createUser.mutateAsync(value)
      form.reset()
    },
  })

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-4">Create User</h1>
      
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="flex flex-col gap-4 max-w-sm mb-8"
      >
        <form.Field
          name="name"
          children={(field) => (
            <div>
              <label htmlFor={field.name} className="block mb-1">Name</label>
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
                  {field.state.meta.errors.join(', ')}
                </em>
              )}
            </div>
          )}
        />

        <form.Field
          name="age"
          children={(field) => (
            <div>
              <label htmlFor={field.name} className="block mb-1">Age</label>
              <input
                id={field.name}
                name={field.name}
                type="number"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                className="border p-2 w-full border-gray-300"
              />
              {field.state.meta.errors.length > 0 && (
                <em role="alert" className="text-red-500 text-sm">
                  {field.state.meta.errors.join(', ')}
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
              <li key={i}>{user.name} ({user.age})</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
