import { Link, useNavigate } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { signInSchema } from '@repo/schemas/auth';

import * as m from '@/@generated/paraglide/messages';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const navigate = useNavigate();

  const signIn = useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      const { data, error } = await authClient.signIn.email(values);

      if (error) {
        throw new Error(error.message ?? 'Unable to log in');
      }

      return data;
    },
    onSuccess: (data) => {
      if (data && 'twoFactorRedirect' in data && data.twoFactorRedirect) {
        void navigate({
          to: '/verify-2fa',
        });
        return;
      }

      void navigate({
        to: '/profile',
      });
    },
  });

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onChange: signInSchema,
    },
    onSubmit: async ({ value }) => {
      await signIn.mutateAsync(value);
    },
  });

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">{m.login_title()}</CardTitle>
          <CardDescription>{m.login_subtitle()}</CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();

              void form.handleSubmit();
            }}
          >
            <FieldGroup>
              {/*
                TODO (OAuth)

                Add social login providers.

                Examples:
                - Google
                - GitHub
                - Microsoft

                Requires:
                - OAuth provider setup
                - Backend callback routes
                - Token verification
                - Account linking
              */}

              <form.Field
                name="email"
                children={(field) => {
                  const errors = field.state.meta.errors;

                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>{m.login_email()}</FieldLabel>

                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        placeholder={m.placeholder_email()}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        aria-invalid={errors.length > 0}
                      />

                      <FieldError errors={errors} />
                    </Field>
                  );
                }}
              />

              <form.Field
                name="password"
                children={(field) => {
                  const errors = field.state.meta.errors;

                  return (
                    <Field>
                      <div className="flex items-center">
                        <FieldLabel htmlFor={field.name}>{m.login_password()}</FieldLabel>
                      </div>

                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        placeholder={m.placeholder_password()}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        aria-invalid={errors.length > 0}
                      />

                      <FieldError errors={errors} />

                      <Link
                        to="/forgot-password"
                        className="ml-auto text-right text-sm text-muted-foreground hover:text-primary"
                      >
                        {m.login_forgot_password()}
                      </Link>
                    </Field>
                  );
                }}
              />

              {signIn.error ? (
                <Alert variant="destructive">
                  <AlertDescription>{signIn.error.message}</AlertDescription>
                </Alert>
              ) : null}

              <Field>
                <div className="flex flex-col items-center gap-4">
                  <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                      <Button
                        className="px-15"
                        type="submit"
                        disabled={!(canSubmit as boolean) || (isSubmitting as boolean)}
                      >
                        {(isSubmitting as boolean) ? (
                          <>
                            <Spinner />
                            {m.button_login()}
                          </>
                        ) : (
                          m.button_login()
                        )}
                      </Button>
                    )}
                  />

                  <FieldDescription className="text-center">
                    {m.login_no_account()}{' '}
                    <Link to="/create-account" className="underline underline-offset-4">
                      {m.login_sign_up()}
                    </Link>
                  </FieldDescription>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        {m.login_continue()}{' '}
        <Link to="/terms-of-service" className="underline underline-offset-4">
          {m.button_terms()}
        </Link>{' '}
        {m.create_account_and()}{' '}
        <Link to="/privacy-policy" className="underline underline-offset-4">
          {m.button_privacy()}
        </Link>
      </FieldDescription>
    </div>
  );
}
