import { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 flex flex-col p-6 lg:p-8 ml-0 lg:ml-64 mt-16">
          <div className="max-w-7xl mx-auto w-full flex-1">{children}</div>
        </main>
      </div>
    </div>
  );
}
