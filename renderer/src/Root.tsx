// ============================================================
// Root composition registration
// ============================================================

import React from 'react';
import { Composition } from 'remotion';
import { CodeShort } from './compositions/CodeShort';
import type { VideoProps } from './types/index';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="CodeShort"
        component={CodeShort as React.FC<any>}
        durationInFrames={300} // Fallback, will be recalculated by calculateMetadata
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          scenes: [
            {
              id: 'default-hook',
              type: 'hook',
              title: 'Hook',
              text: 'Stop using loops for everything!',
              duration_frames: 90,
              animation: 'pop',
              transition: 'fade',
            },
            {
              id: 'default-code',
              type: 'code',
              title: 'Map Method',
              code: 'const doubled = [1, 2, 3].map(x => x * 2);\nconsole.log(doubled);',
              language: 'javascript',
              output: '[2, 4, 6]',
              duration_frames: 150,
              animation: 'fade',
              transition: 'slide',
            },
            {
              id: 'default-cta',
              type: 'cta',
              title: 'Call to Action',
              text: 'Subscribe for daily coding tips!',
              duration_frames: 90,
              animation: 'bounce',
              transition: 'none',
            },
          ] as any[],
          template: {
            backgroundColor: '#1a1a2e',
            fontFamily: 'JetBrains Mono',
            fontSize: 16,
            accentColor: '#7c3aed',
            textColor: '#ffffff',
            codeTheme: 'github-dark',
            containerStyle: 'rounded',
            glowEffect: true,
          },
          audioMode: 'none',
        } as VideoProps}
        calculateMetadata={({ props }: any) => {
          const videoProps = props as VideoProps;
          const totalFrames = (videoProps.scenes || []).reduce(
            (sum: number, scene: any) => sum + (scene.duration_frames || 90),
            0
          );
          return {
            durationInFrames: Math.max(30, totalFrames),
          };
        }}
      />
    </>
  );
};
