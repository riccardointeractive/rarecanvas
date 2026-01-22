/**
 * Admin Types
 */

export interface AdminTool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  status: 'active' | 'coming';
  badge: string;
  badgeColor: 'green' | 'blue';
}

export interface ToolCategory {
  category: string;
  items: AdminTool[];
}

export interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

export interface QuickLink {
  title: string;
  url: string;
}
