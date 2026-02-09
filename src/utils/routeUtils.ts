// Função pura para verificar se uma rota está ativa, recebendo o pathname atual
export const isActiveRoute = (
  pathname: string,
  url: string,
  items?: { url: string }[],
) => {
  // Para rota raiz
  if (url === "/" && pathname === "/") {
    return true;
  }

  // Para outras rotas principais
  if (url !== "/" && url !== "#" && pathname.includes(url)) {
    return true;
  }

  // Para itens de submenu
  if (items) {
    return items.some(
      (item) => item.url !== "#" && pathname.includes(item.url),
    );
  }

  return false;
};
