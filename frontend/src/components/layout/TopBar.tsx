import { Link } from 'react-router-dom';
import { Logo } from '@/components/brand/Logo';
import { UserMenu } from './UserMenu';

/** Sticky, hairline-bottom app bar with a soft blur — not a heavy edge-to-edge slab. */
export function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-fog/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-content items-center justify-between px-5 sm:px-8">
        <Link to="/" className="transition-opacity hover:opacity-80">
          <Logo />
        </Link>
        <UserMenu />
      </div>
    </header>
  );
}
