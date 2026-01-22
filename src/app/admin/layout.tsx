import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Admin Panel - Digiko',
  description: 'Digiko Admin Dashboard - Manage platform tools and settings',
};

/**
 * Admin Layout
 * 
 * This layout wraps ALL /admin/* routes
 * IMPORTANT: In Next.js App Router, nested layouts should NOT have html/body tags
 * The root layout provides html/body, this just wraps content
 * No main Digiko header, no footer - clean admin interface
 * Individual admin pages will add AdminSidebar + AdminHeader via AdminLayout component
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-base">
      {/* No navigation header here - AdminLayout component handles it */}
      {children}
    </div>
  );
}
