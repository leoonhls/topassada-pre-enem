import { useLocation } from "react-router-dom";

// Função para verificar se uma rota está ativa
export const isActiveRoute = (url: string, items?: { url: string }[]) => {
  const location = useLocation();

  // Para rota raiz
  if (url === "/" && location.pathname === "/") {
    return true;
  }

  // Para outras rotas principais
  if (url !== "/" && url !== "#" && location.pathname.includes(url)) {
    return true;
  }

  // Para itens de submenu
  if (items) {
    return items.some(
      (item) => item.url !== "#" && location.pathname.includes(item.url)
    );
  }

  return false;
};
