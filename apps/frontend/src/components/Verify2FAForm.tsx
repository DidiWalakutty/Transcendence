import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';

import * as m from '@/@generated/paraglide/messages';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

export function Verify2FAForm({ className, ...props }: React.ComponentProps<'div'>) {
  const navigate = useNavigate();
  const [useBackupCode, setUseBackupCode] = useState(false);

  const verify = useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = useBackupCode
        ? await authClient.twoFactor.verifyBackupCode({ code })
        : await authClient.twoFactor.verifyTotp({ code });

      if (error) {
        throw new Error(error.message ?? m.verify_2fa_error_default(), { cause: error.code });
      }

      return data;
    },
    onSuccess: () => {
      void navigate({ to: '/profile' });
    },
  });

  const form = useForm({
    defaultValues: { code: '' },
    onSubmit: async ({ value }) => {
      await verify.mutateAsync(value.code);
    },
  });

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">{m.verify_2fa_title()}</CardTitle>
          <CardDescription>
            {useBackupCode ? m.verify_2fa_subtitle_backup() : m.verify_2fa_subtitle_totp()}
          </CardDescription>
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
                name="code"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>{m.verify_2fa_code_label()}</FieldLabel>

                    {useBackupCode ? (
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder={m.verify_2fa_backup_placeholder()}
                      />
                    ) : (
                      <InputOTP
                        maxLength={6}
                        value={field.state.value}
                        onChange={(value) => field.handleChange(value)}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    )}
                  </Field>
                )}
              />

              {verify.error ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    {verify.error.cause === 'INVALID_TWO_FACTOR_COOKIE'
                      ? m.verify_2fa_session_expired()
                      : verify.error.message}
                  </AlertDescription>
                </Alert>
              ) : null}

              <FieldDescription className="text-center">
                <Link to="/login" className="underline underline-offset-4">
                  {m.verify_2fa_back_to_login()}
                </Link>
              </FieldDescription>

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
                            {m.verify_2fa_button_verifying()}
                          </>
                        ) : (
                          m.verify_2fa_button()
                        )}
                      </Button>
                    )}
                  />

                  <FieldDescription className="text-center">
                    <button
                      type="button"
                      className="underline underline-offset-4"
                      onClick={() => setUseBackupCode((prev) => !prev)}
                    >
                      {useBackupCode ? m.verify_2fa_use_totp() : m.verify_2fa_use_backup()}
                    </button>
                  </FieldDescription>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
