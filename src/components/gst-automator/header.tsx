import Link from 'next/link';

export function Header() {
  return (
    <header className="py-4 border-b bg-card">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-primary">
          <span>GST File Automator</span>
        </Link>
      </div>
    </header>
  );
}
