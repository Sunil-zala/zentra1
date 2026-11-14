import { useEffect, useCallback } from "react";
import {
  Link as TanStackLink,
  Outlet as TanStackOutlet,
  useLocation as useTanStackLocation,
  useNavigate as useTanStackNavigate,
} from "@tanstack/react-router";

type NavigateOptions = { replace?: boolean };

type AnchorProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

function withoutUndefined<T extends Record<string, unknown>>(props: T) {
  return Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined)) as T;
}

export type NavLinkProps = Omit<AnchorProps, "className"> & {
  to: string;
  end?: boolean;
  className?: string | ((args: { isActive: boolean }) => string);
};

export function useNavigate() {
  const navigate = useTanStackNavigate();
  return useCallback(
    (to: string, options?: NavigateOptions) => {
      const navigateOptions = options?.replace === undefined ? {} : { replace: options.replace };
      return navigate({ to: to as never, ...navigateOptions });
    },
    [navigate],
  );
}

export function Link({
  to,
  children,
  className,
  ...props
}: AnchorProps & { to: string }) {
  const safeProps = withoutUndefined(props) as React.ComponentProps<typeof TanStackLink>;
  return (
    <TanStackLink to={to as never} className={className} {...safeProps}>
      {children}
    </TanStackLink>
  );
}

export function NavLink({
  to,
  children,
  className,
  end = false,
  ...props
}: NavLinkProps) {
  const { pathname } = useTanStackLocation();
  const isActive = end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
  const resolvedClassName = typeof className === "function" ? className({ isActive }) : className;
  const safeProps = withoutUndefined(props) as React.ComponentProps<typeof TanStackLink>;

  return (
    <TanStackLink to={to as never} className={resolvedClassName} {...safeProps}>
      {children}
    </TanStackLink>
  );
}

export function useLocation() {
  const location = useTanStackLocation();
  return { pathname: location.pathname, search: location.searchStr, hash: location.hash };
}

export function Navigate({ to, replace = false }: { to: string; replace?: boolean }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace });
  }, [navigate, replace, to]);
  return null;
}

export const Outlet = TanStackOutlet;
