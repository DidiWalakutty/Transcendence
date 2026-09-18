import { StrictMode, startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { StartClient } from '@tanstack/react-start/client';

// Firefox aborts a page's in-flight requests as soon as a full navigation
// starts (reload, typed URL, external link). A route loader still running at
// that moment rejects, its error boundary catches the rejection and React
// reports every caught error to the console by default. Leaving the page is
// not an error of the page, so nothing is reported once the user is on the
// way out. Chrome and Safari leave aborted requests pending instead.
let leaving = false;
window.addEventListener('beforeunload', () => {
  leaving = true;
});

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>,
    {
      onCaughtError(error) {
        if (!leaving) console.error(error);
      },
    },
  );
});
