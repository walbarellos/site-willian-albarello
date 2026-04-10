'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type CSSProperties } from 'react';

export type AdminSidebarNavItem = {
  href: string;
  label: string;
  description: string;
};

type AdminSidebarNavProps = {
  items: AdminSidebarNavItem[];
};

function parseHref(href: string) {
  const [path, queryString] = href.split('?');
  const query = new URLSearchParams(queryString ?? '');
  return { path, query };
}

function isActiveItem(
  href: string,
  pathname: string,
  searchParams: URLSearchParams,
): boolean {
  const { path, query } = parseHref(href);

  if (pathname !== path) {
    return false;
  }

  const status = query.get('status');

  if (!status) {
    return true;
  }

  return searchParams.get('status') === status;
}

export function AdminSidebarNav({ items }: AdminSidebarNavProps) {
  const pathname = usePathname();
  const [searchParams, setSearchParams] = useState<URLSearchParams>(
    new URLSearchParams(),
  );

  useEffect(() => {
    setSearchParams(new URLSearchParams(window.location.search));
  }, []);

  return (
    <ul
      style={{
        display: 'grid',
        gap: '0.6rem',
        listStyle: 'none',
        padding: 0,
        margin: 0,
      }}
    >
      {items.map((item) => {
        const active = isActiveItem(item.href, pathname, searchParams);

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? 'page' : undefined}
              style={{
                ...sidebarLinkStyle,
                background: active ? 'rgba(37, 99, 235, 0.2)' : sidebarLinkStyle.background,
                border: active
                  ? '1px solid rgba(96, 165, 250, 0.45)'
                  : sidebarLinkStyle.border,
                boxShadow: active
                  ? '0 10px 24px rgba(37, 99, 235, 0.22)'
                  : 'none',
              }}
            >
              <span
                style={{
                  display: 'grid',
                  gap: '0.18rem',
                }}
              >
                <span
                  style={{
                    color: active ? '#ffffff' : '#f8fafc',
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    color: active ? '#dbeafe' : '#94a3b8',
                    fontSize: '0.82rem',
                    lineHeight: 1.45,
                  }}
                >
                  {item.description}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

const sidebarLinkStyle: CSSProperties = {
  display: 'grid',
  gap: '0.25rem',
  padding: '0.95rem 1rem',
  borderRadius: 16,
  textDecoration: 'none',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(148, 163, 184, 0.10)',
};
