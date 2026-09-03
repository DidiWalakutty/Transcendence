import { createFileRoute } from '@tanstack/react-router';
import { SignUpForm } from '@/components/CreateAccountForm';

export const Route = createFileRoute('/signup')({
  component: SignupPage,
});

function SignupPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-32 md:px-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SignUpForm />
      </div>
    </div>
  );
}
