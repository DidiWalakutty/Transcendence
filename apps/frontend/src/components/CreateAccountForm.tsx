import { Link, useNavigate } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { signUpSchema } from '@repo/schemas/auth';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

export function SignUpForm({ className, ...props }: React.ComponentProps<'div'>) {
  const navigate = useNavigate();

  const signUp = useMutation({
    mutationFn: async (values: {
      name: string;
      email: string;
      username: string;
      password: string;
    }) => {
      const { data, error } = await authClient.signUp.email(values);

      if (error) {
        throw new Error(error.message ?? 'Unable to create an account');
      }

      return data;
    },
    onSuccess: () => {
      void navigate({ to: '/' });
    },
  });

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      onChange: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      const { confirmPassword: _confirmPassword, ...values } = value;

      await signUp.mutateAsync(values);
    },
  });

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Create an account</CardTitle>

          <CardDescription>Sign up to discover and manage your events</CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field
                name="name"
                children={(field) => {
                  const errors = field.state.meta.errors;

                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Full name</FieldLabel>

                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        placeholder="Your Name"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={errors.length > 0}
                      />
                      <FieldError errors={errors} />
                    </Field>
                  );
                }}
              />

              <form.Field
                name="email"
                children={(field) => {
                  const errors = field.state.meta.errors;

                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>

                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        placeholder="your.email@example.com"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={errors.length > 0}
                      />
                      <FieldError errors={errors} />
                    </Field>
                  );
                }}
              />

              <form.Field
                name="username"
                children={(field) => {
                  const errors = field.state.meta.errors;

                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Username</FieldLabel>

                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        placeholder="your_username"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={errors.length > 0}
                      />
                      <FieldError errors={errors} />
                    </Field>
                  );
                }}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field
                  name="password"
                  children={(field) => {
                    const errors = field.state.meta.errors;

                    return (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>

                        <Input
                          id={field.name}
                          name={field.name}
                          type="password"
                          placeholder="********"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={errors.length > 0}
                        />
                        <FieldError errors={errors} />
                      </Field>
                    );
                  }}
                />

                <form.Field
                  name="confirmPassword"
                  children={(field) => {
                    const errors = field.state.meta.errors;

                    return (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>

                        <Input
                          id={field.name}
                          name={field.name}
                          type="password"
                          placeholder="********"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={errors.length > 0}
                        />
                        <FieldError errors={errors} />
                      </Field>
                    );
                  }}
                />
              </div>

              <FieldDescription className="text-center">
                Password must be at least 8 characters.
              </FieldDescription>

              {signUp.error ? (
                <Alert variant="destructive">
                  <AlertDescription>{signUp.error.message}</AlertDescription>
                </Alert>
              ) : null}

              <Field>
                {/*
										Future:
										Add OAuth providers here for social sign up (e.g., Google etc.)

										Requires:
										- OAuth integration
										- Backend callback routes
										- Token verification
										- Account linking
									*/}
                <div className="flex flex-col items-center gap-4">
                  <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                      <Button
                        className="px-10"
                        type="submit"
                        disabled={!(canSubmit as boolean) || (isSubmitting as boolean)}
                      >
                        {(isSubmitting as boolean) ? (
                          <>
                            <Spinner />
                            Creating account
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </Button>
                    )}
                  />

                  <FieldDescription className="text-center">
                    Already have an account?{' '}
                    <Link to="/login" className="underline underline-offset-4">
                      Sign in
                    </Link>
                  </FieldDescription>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By signing up, you agree to our{' '}
        <Link to="/terms-of-service" className="underline underline-offset-4">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link to="/privacy-policy" className="underline underline-offset-4">
          Privacy Policy
        </Link>
      </FieldDescription>
    </div>
  );
}
