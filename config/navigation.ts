export interface NavItem {
  label: string;
  href: string;
  icon: string;
  match: (pathname: string) => boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      {
        label: "Overview",
        href: "/dashboard",
        icon: "home",
        match: (pathname) => pathname === "/dashboard",
      },
      {
        label: "My surveys",
        href: "/dashboard/surveys",
        icon: "layers",
        match: (pathname) => pathname.startsWith("/dashboard/surveys"),
      },
      {
        label: "Create survey",
        href: "/builder/new",
        icon: "plus",
        match: (pathname) => pathname.startsWith("/builder"),
      },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        label: "Responses",
        href: "/dashboard/responses",
        icon: "inbox",
        match: (pathname) => pathname.startsWith("/dashboard/responses"),
      },
      {
        label: "Analytics",
        href: "/dashboard/analytics",
        icon: "chart",
        match: (pathname) => pathname.startsWith("/dashboard/analytics"),
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: "settings",
        match: (pathname) => pathname.startsWith("/dashboard/settings"),
      },
    ],
  },
];

export const pageLabels: Record<string, string> = {
  dashboard: "Overview",
  surveys: "My surveys",
  responses: "Responses",
  analytics: "Analytics",
  settings: "Settings",
  builder: "Survey builder",
};
