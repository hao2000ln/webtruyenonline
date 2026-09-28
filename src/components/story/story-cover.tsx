const palettes = [
  "bg-teal-800",
  "bg-slate-800",
  "bg-amber-700",
  "bg-cyan-800",
];

type StoryCoverProps = {
  title: string;
  slug: string;
  coverUrl?: string | null;
  className?: string;
};

export function StoryCover({ title, slug, coverUrl, className = "" }: StoryCoverProps) {
  const paletteIndex = [...slug].reduce((sum, character) => sum + character.charCodeAt(0), 0) % palettes.length;

  return (
    <div
      className={`relative aspect-[2/3] overflow-hidden rounded-lg ${palettes[paletteIndex]} ${className}`}
      aria-label={`Bìa truyện ${title}`}
      role="img"
    >
      {coverUrl ? <Image src={coverUrl} alt={`Bìa truyện ${title}`} fill sizes="(max-width: 640px) 112px, 220px" className="object-cover" /> : <div className="absolute inset-x-3 bottom-3 border-t border-white/40 pt-3 text-center text-sm font-semibold leading-tight text-white">{title}</div>}
    </div>
  );
}
import Image from "next/image";

