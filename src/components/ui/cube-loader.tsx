import { cn } from '../../lib/utils';

type CubeLoaderProps = {
  className?: string;
  title?: string;
  subtitle?: string;
  minHeightClassName?: string;
};

export default function CubeLoader({
  className,
  title = 'Loading',
  subtitle = 'Preparing reviews, please wait...',
  minHeightClassName = 'min-h-[360px]',
}: CubeLoaderProps) {
  return (
    <div
      className={cn(
        'cube-loader-scene flex flex-col items-center justify-center gap-10 rounded-[32px] border border-black/5 bg-[#f6f2ea] px-6 py-12',
        minHeightClassName,
        className,
      )}
    >
      <div className="cube-loader-stage relative flex h-24 w-24 items-center justify-center">
        <div className="cube-loader-spin relative h-full w-full">
          <div className="cube-loader-core absolute inset-0 m-auto h-8 w-8 rounded-full bg-[#fffaf3]" />

          <div className="cube-loader-side cube-loader-front">
            <div className="cube-loader-face cube-loader-face-cyan" />
          </div>
          <div className="cube-loader-side cube-loader-back">
            <div className="cube-loader-face cube-loader-face-cyan" />
          </div>
          <div className="cube-loader-side cube-loader-right">
            <div className="cube-loader-face cube-loader-face-rose" />
          </div>
          <div className="cube-loader-side cube-loader-left">
            <div className="cube-loader-face cube-loader-face-rose" />
          </div>
          <div className="cube-loader-side cube-loader-top">
            <div className="cube-loader-face cube-loader-face-indigo" />
          </div>
          <div className="cube-loader-side cube-loader-bottom">
            <div className="cube-loader-face cube-loader-face-indigo" />
          </div>
        </div>

        <div className="cube-loader-shadow absolute -bottom-16 h-8 w-24 rounded-[100%] bg-black/20 blur-xl" />
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.34em] text-[#63755A]">
          {title}
        </h3>
        <p className="max-w-[280px] text-sm leading-6 text-[#6b6b6b]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
