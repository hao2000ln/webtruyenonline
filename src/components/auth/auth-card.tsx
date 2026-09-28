import Link from "next/link";

type AuthCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthCard({ eyebrow, title, description, children }: AuthCardProps) {
  return (
    <main className="site-container flex min-h-[68vh] items-center justify-center py-12">
      <section className="panel w-full max-w-md" aria-labelledby="auth-title">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
        <h1 id="auth-title" className="mt-2 text-[28px] font-bold leading-tight text-content">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-content-secondary">{description}</p>
        {children}
        <Link href="/" className="mt-6 inline-block text-sm font-semibold text-primary hover:text-primary-hover">
          ← Trở về trang chủ
        </Link>
      </section>
    </main>
  );
}
