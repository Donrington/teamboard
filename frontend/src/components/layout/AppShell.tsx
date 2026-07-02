import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';

/** Frame for every authenticated page: sticky top bar + a centered content column. */
export function AppShell() {
  return (
    <div className="min-h-[100dvh]">
      <TopBar />
      <main className="mx-auto w-full max-w-content px-5 pb-28 pt-10 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}
