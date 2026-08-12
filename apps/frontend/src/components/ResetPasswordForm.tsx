import { Link, useNavigate } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { resetPasswordSchema } from '@repo/schemas/auth';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { getLocale } from '@/@generated/paraglide/runtime';

export function ResetPasswordForm({
  token,
  className,
  ...props
}: { token: string } & React.ComponentProps<'div'>) {
  const navigate = useNavigate();
  const locale = getLocale();

  const resetPassword = useMutation({
    mutationFn: async (values: { newPassword: string }) => {
      const { data, error } = await authClient.resetPassword({
        newPassword: values.newPassword,
        token,
      });

      if (error) {
        throw new Error(error.message ?? 'Unable to reset the password');
      }

      return data;
    },
    onSuccess: () => {
      void navigate({ to: '/$locale/login', params: { locale } });
    },
  });

  const form = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validators: {
      onChange: resetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      await resetPassword.mutateAsync({ newPassword: value.newPassword });
    },
  });

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Set a new password</CardTitle>

          <CardDescription>Choose a new password for your account</CardDescription>
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
                name="newPassword"
                children={(field) => {
                  const errors = field.state.meta.errors;

                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>New password</FieldLabel>

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
                      <FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>

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

              {resetPassword.error ? (
                <Alert variant="destructive">
                  <AlertDescription>{resetPassword.error.message}</AlertDescription>
                </Alert>
              ) : null}

              <Field>
                <div className="flex flex-col items-center gap-4">
                  <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                      <>
                        <Button
                          className="w-fit px-8"
                          type="submit"
                          disabled={!(canSubmit as boolean) || (isSubmitting as boolean)}
                        >
                          {(isSubmitting as boolean) ? (
                            <>
                              <Spinner />
                              Saving
                            </>
                          ) : (
                            'Reset Password'
                          )}
                        </Button>

                        <FieldDescription className="text-center">
                          <Link
                            to="/$locale/login"
                            params={{ locale }}
                            className="underline underline-offset-4"
                          >
                            Back to log in
                          </Link>
                        </FieldDescription>
                      </>
                    )}
                  />
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
