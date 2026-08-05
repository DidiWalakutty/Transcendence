import { Link } from '@tanstack/react-router';

import { getLocale } from '@/@generated/paraglide/runtime';
import * as m from '@/@generated/paraglide/messages';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const locale = getLocale();

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      {/*
        TODO (Authentication)

        Connect this form to the authentication system.

        Requires:
        - TanStack Form
        - Zod validation
        - tRPC login mutation
        - Session management
        - Loading state
        - Error handling
        - Redirect after successful login
        - Remember authenticated user
      */}

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">{m.login_title()}</CardTitle>

          <CardDescription>{m.login_subtitle()}</CardDescription>
        </CardHeader>

        <CardContent>
          <form>
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

              {/* Email */}
              <Field>
                <FieldLabel htmlFor="email">{m.login_email()}</FieldLabel>

                <Input id="email" type="email" placeholder={m.placeholder_email()} required />
              </Field>

              {/* Password */}
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">{m.login_password()}</FieldLabel>
                </div>

                <Input
                  id="password"
                  type="password"
                  placeholder={m.placeholder_password()}
                  required
                />

                <Link
                  to="/$locale/forgot-password"
                  params={{ locale }}
                  className="ml-auto text-right text-sm text-muted-foreground hover:text-primary"
                >
                  {m.login_forgot_password()}
                </Link>
              </Field>

              {/* Submit */}
              <Field>
                <div className="flex flex-col items-center gap-4">
                  <Button className="px-15" type="submit">
                    {m.button_login()}
                  </Button>

                  <FieldDescription className="text-center">
                    {m.login_no_account()}{' '}
                    <Link
                      to="/$locale/create-account"
                      params={{ locale }}
                      className="underline underline-offset-4"
                    >
                      {m.login_sign_up()}
                    </Link>
                  </FieldDescription>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* Terms */}
      <FieldDescription className="px-6 text-center">
        {m.login_continue()}{' '}
        <Link
          to="/$locale/terms-of-service"
          params={{ locale }}
          className="underline underline-offset-4"
        >
          {m.button_terms()}
        </Link>{' '}
        {m.create_account_and()}{' '}
        <Link
          to="/$locale/privacy-policy"
          params={{ locale }}
          className="underline underline-offset-4"
        >
          {m.button_privacy()}
        </Link>
      </FieldDescription>
    </div>
  );
}
