// Função pura para verificar se uma rota está ativa, recebendo o pathname atual
export const isActiveRoute = (
  pathname: string,
  url: string,
  items?: { url: string }[],
) => {
  const normalize = (p: string) => {
    if (!p) return "/";
    if (p === "#") return "#";
    const withSlash = p.startsWith("/") ? p : `/${p}`;
    if (withSlash.length > 1 && withSlash.endsWith("/")) {
      return withSlash.slice(0, -1);
    }
    return withSlash;
  };

  const isActivePath = (currentPath: string, target: string) => {
    const current = normalize(currentPath);
    const t = normalize(target);
    if (t === "#") return false;
    if (t === "/") return current === "/";
    return current === t || current.startsWith(`${t}/`);
  };

  if (isActivePath(pathname, url)) return true;
  if (items?.length)
    return items.some((item) => isActivePath(pathname, item.url));
  return false;
};
