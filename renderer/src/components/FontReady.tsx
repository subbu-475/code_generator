import { useEffect, useState } from 'react';
import { continueRender, delayRender } from 'remotion';

export const FontReady: React.FC = () => {
  const [handle] = useState(() =>
    delayRender('Waiting for video fonts to settle', {
      timeoutInMilliseconds: 5000,
    }),
  );

  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts) {
      continueRender(handle);
      return;
    }

    let cancelled = false;

    const timeout = new Promise<void>((resolve) => {
      window.setTimeout(resolve, 3000);
    });

    Promise.race([document.fonts.ready.then(() => undefined), timeout])
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          continueRender(handle);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [handle]);

  return null;
};
