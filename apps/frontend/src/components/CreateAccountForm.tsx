import { Link, useNavigate } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { signUpSchema } from '@repo/schemas/auth';

import { getLocale } from '@/@generated/paraglide/runtime';
import * as m from '@/@generated/paraglide/messages';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

import { toast } from 'sonner';

export function SignUpForm({ className, ...props }: React.ComponentProps<'div'>) {
  const navigate = useNavigate();
  const locale = getLocale();

  const signUp = useMutation({
    mutationFn: async (values: {
      name: string;
      email: string;
      username: string;
      password: string;
    }) => {
      const { data, error } = await authClient.signUp.email({
        ...values,
        preferedLanguage: locale,
      } as any);

      if (error) {
        throw new Error(error.message ?? 'Unable to create an account');
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Account created successfully!');

      void navigate({
        to: '/',
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create an account.');
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
          <CardTitle className="text-3xl">{m.create_account_title()}</CardTitle>

          <CardDescription>{m.create_account_subtitle()}</CardDescription>
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
              <form.Field
                name="name"
                children={(field) => {
                  const errors = field.state.meta.errors;

                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>{m.create_account_full_name()}</FieldLabel>

                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        placeholder={m.placeholder_name()}
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
                        onChange={(event) => field.handleChange(event.target.value)}
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
                        placeholder={m.placeholder_username()}
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

              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field
                  name="password"
                  children={(field) => {
                    const errors = field.state.meta.errors;

                    return (
                      <Field>
                        <FieldLabel htmlFor={field.name}>{m.create_account_password()}</FieldLabel>

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
                          {m.create_account_confirm_password()}
                        </FieldLabel>

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
                      </Field>
                    );
                  }}
                />
              </div>

              <FieldDescription className="text-center">
                {m.create_account_password_info()}
              </FieldDescription>

              {signUp.error ? (
                <Alert variant="destructive">
                  <AlertDescription>{signUp.error.message}</AlertDescription>
                </Alert>
              ) : null}

              {/*
                TODO (OAuth)

                Add social sign-up providers.

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

              <Field>
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
                            {m.button_create_account()}
                          </>
                        ) : (
                          m.button_create_account()
                        )}
                      </Button>
                    )}
                  />

                  <FieldDescription className="text-center">
                    {m.create_account_already_have_account()}{' '}
                    <Link to="/login" className="underline underline-offset-4">
                      {m.create_account_sign_in()}
                    </Link>
                  </FieldDescription>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        {m.create_account_info()}{' '}
        <Link to="/terms-of-service" className="underline underline-offset-4">
          {m.create_account_terms()}
        </Link>{' '}
        {m.create_account_and()}{' '}
        <Link to="/privacy-policy" className="underline underline-offset-4">
          {m.create_account_privacy()}
        </Link>
      </FieldDescription>
    </div>
  );
}
