import { Link } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { forgotPasswordSchema } from '@repo/schemas/auth';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import * as m from '@/@generated/paraglide/messages';
import { getLocale } from '@/@generated/paraglide/runtime';

export function ForgotPassword({ className, ...props }: React.ComponentProps<'div'>) {
  const requestReset = useMutation({
    mutationFn: async (values: { email: string }) => {
      const { data, error } = await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new Error(m.forgot_password_error());
      }

      return data;
    },
  });

  const form = useForm({
    defaultValues: {
      email: '',
    },
    validators: {
      onChange: forgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      await requestReset.mutateAsync(value);
    },
  });

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">{m.forgot_password_title()}</CardTitle>

          <CardDescription className="mt-4 text-md">
            {m.forgot_password_subtitle_1()} <br />
            {m.forgot_password_subtitle_2()}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {requestReset.isSuccess ? (
            <FieldDescription className="text-center">{m.forgot_password_info()}</FieldDescription>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void form.handleSubmit();
              }}
            >
              <FieldGroup>
                <form.Field
                  name="email"
                  children={(field) => {
                    const errors = field.state.meta.errors;

                    return (
                      <Field>
                        <FieldLabel htmlFor={field.name}>{m.create_account_email()}</FieldLabel>

                        <Input
                          id={field.name}
                          name={field.name}
                          type="email"
                          placeholder={m.placeholder_email()}
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

                {requestReset.error ? (
                  <Alert variant="destructive">
                    <AlertDescription>{requestReset.error.message}</AlertDescription>
                  </Alert>
                ) : null}

                <Field>
                  <div className="flex justify-center">
                    <form.Subscribe
                      selector={(state) => [state.canSubmit, state.isSubmitting]}
                      children={([canSubmit, isSubmitting]) => (
                        <Button
                          className="w-fit px-8"
                          type="submit"
                          disabled={!(canSubmit as boolean) || (isSubmitting as boolean)}
                        >
                          {(isSubmitting as boolean) ? (
                            <>
                              <Spinner />
                              {m.button_spinner_sending()}
                            </>
                          ) : (
                            m.forgot_password_button()
                          )}
                        </Button>
                      )}
                    />
                  </div>
                </Field>

                <FieldDescription className="text-center">
                  {m.forgot_password_remember()}{' '}
                  <Link
                    to="/$locale/login"
                    params={{ locale: getLocale() }}
                    className="underline underline-offset-4"
                  >
                    {m.login_button()}
                  </Link>
                </FieldDescription>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
