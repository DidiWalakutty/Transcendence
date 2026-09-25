import { Link, useNavigate } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { makeResetPasswordSchema } from '@repo/schemas/auth';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';
import { getLocale } from '@/@generated/paraglide/runtime';
import * as m from '@/@generated/paraglide/messages';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

export function ResetPasswordForm({
  token,
  className,
  ...props
}: { token: string } & React.ComponentProps<'div'>) {
  const navigate = useNavigate();

  const resetPassword = useMutation({
    mutationKey: ['auth', 'resetPassword'],
    mutationFn: async (values: { newPassword: string }) => {
      const { data, error } = await authClient.resetPassword({
        newPassword: values.newPassword,
        token,
      });

      if (error) {
        throw new Error(error.message ?? m.reset_password_error_default());
      }

      return data;
    },
    onSuccess: () => {
      void navigate({ to: '/login' });
    },
  });

  const form = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validators: {
      onChange: makeResetPasswordSchema(getLocale()),
    },
    onSubmit: async ({ value }) => {
      // A rejected mutation is shown through the mutation's error state and the
      // global toast; it must not escape as an uncaught promise in the console.
      await resetPassword.mutateAsync({ newPassword: value.newPassword }).catch(() => undefined);
    },
  });

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">{m.reset_password_title()}</CardTitle>

          <CardDescription>{m.reset_password_subtitle()}</CardDescription>
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
                      <FieldLabel htmlFor={field.name}>
                        {m.reset_password_new_password()}
                      </FieldLabel>

                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        placeholder={m.placeholder_password()}
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
                      <FieldLabel htmlFor={field.name}>
                        {m.reset_password_confirm_password()}
                      </FieldLabel>

                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        placeholder={m.placeholder_password()}
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
                              {m.reset_password_saving()}
                            </>
                          ) : (
                            m.reset_password_button()
                          )}
                        </Button>

                        <FieldDescription className="text-center">
                          <Link to="/login" className="underline underline-offset-4">
                            {m.reset_password_back_to_login()}
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
