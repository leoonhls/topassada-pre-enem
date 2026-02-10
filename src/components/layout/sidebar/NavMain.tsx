"use client";

import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ComponentType<any>;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
      isActive?: boolean;
    }[];
  }[];
}) {
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();

  const toAbs = (url: string) => {
    if (!url) return "/";
    if (url === "#") return "#";
    return url.startsWith("/") ? url : `/${url}`;
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item, i) =>
          item.items?.length ? (
            <Collapsible
              key={item.title + i}
              asChild
              defaultOpen={!!item.isActive}
              className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={!!item.isActive}
                    className={item.isActive ? "" : "text-muted-foreground"}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem, i) => (
                      <SidebarMenuSubItem key={subItem.title + i}>
                        <SidebarMenuSubButton
                          href={toAbs(subItem.url)}
                          isActive={!!subItem.isActive}
                          className={
                            subItem.isActive ? "" : "text-muted-foreground"
                          }
                          onClick={(e) => {
                            e.preventDefault();
                            const target = toAbs(subItem.url);
                            if (target !== "#") navigate(target);
                            setOpenMobile(false);
                          }}>
                          <span>{subItem.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title + i}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={!!item.isActive}
                className={item.isActive ? "" : "text-muted-foreground"}
                onClick={(_) => {
                  const target = toAbs(item.url);
                  if (target !== "#") navigate(target);
                  setOpenMobile(false);
                }}>
                {" "}
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
