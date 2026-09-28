import Image from "next/image";

const palettes = [
  "bg-teal-800",
  "bg-slate-800",
  "bg-amber-700",
  "bg-cyan-800",
];

type StoryCoverProps = {
  title: string;
  slug?: string;
  coverUrl?: string | null;
  className?: string;
};

export function StoryCover({
  title,
  slug = "",
  coverUrl,
  className = "",
}: StoryCoverProps) {
  const paletteIndex = [...slug].reduce((sum, character) => sum + character.charCodeAt(0), 0) % palettes.length;

  return (
    <div
      className={`relative aspect-[2/3] overflow-hidden rounded-lg ${palettes[paletteIndex]} ${className}`}
      aria-label={`Bìa truyện ${title}`}
      role="img"
    >
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={`Bìa truyện ${title}`}
          fill
          sizes="(max-width: 640px) 112px, 220px"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-x-2 bottom-2 border-t border-white/30 pt-2 text-center text-xs font-semibold leading-tight text-white line-clamp-2">
          {title}
        </div>
      )}
    </div>
  );
}

type HeroCoverProps = {
  title: string;
  slug?: string;
  coverUrl?: string | null;
  authorName?: string | null;
  rating?: number | string;
  className?: string;
};

export function HeroStoryCover({
  title,
  coverUrl,
  authorName,
  rating = 4.9,
  className = "",
}: HeroCoverProps) {
  return (
    <div
      className={`book-cover-3d relative aspect-[2/3] w-48 sm:w-52 h-68 sm:h-72 flex-shrink-0 overflow-hidden rounded-2xl border border-teal-700/30 bg-gradient-to-br from-[#115e59] via-[#134e4a] to-slate-900 p-5 text-white flex flex-col justify-between ${className}`}
      aria-label={`Bìa truyện ${title}`}
      role="img"
    >
      {/* Book Spine Accent */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-3 border-r border-white/10 bg-white/10"
        aria-hidden="true"
      />

      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={`Bìa truyện ${title}`}
          fill
          sizes="(max-width: 640px) 192px, 208px"
          className="object-cover"
        />
      ) : (
        <>
          {/* Top Bar on Cover */}
          <div className="relative z-10 flex items-start justify-between pl-2">
            <span className="rounded-md border border-teal-700/50 bg-teal-900/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-200 backdrop-blur-md">
              Mộc Thư
            </span>
            <span className="text-amber-500 drop-shadow-sm text-sm">🔖</span>
          </div>

          {/* Center Book Title & Author */}
          <div className="relative z-10 my-auto py-4 pl-2 text-center">
            <h3 className="line-clamp-3 text-lg font-extrabold leading-snug tracking-tight text-white drop-shadow-md sm:text-xl">
              {title}
            </h3>
            {authorName && (
              <p className="mt-2 text-xs italic text-teal-200/80 font-serif line-clamp-1">
                {authorName}
              </p>
            )}
          </div>

          {/* Bottom Bar on Cover */}
          <div className="relative z-10 flex items-center justify-between border-t border-teal-700/40 pt-3 pl-2 text-[11px] text-teal-200/70">
            <span>Sách Chữ</span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="text-[10px]">★</span>
              <span>{rating}</span>
            </span>
          </div>
        </>
      )}
    </div>
  );
}
