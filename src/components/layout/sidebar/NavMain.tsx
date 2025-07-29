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
import { Button } from "@/components/ui/button";

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
                        <SidebarMenuSubButton asChild>
                          <Button
                            className={`p- w-full justify-start items-center ${
                              subItem.isActive ? "" : "text-muted-foreground"
                            }`}
                            onClick={(_) => {
                              navigate(`${subItem.url}`);
                              setOpenMobile(false);
                            }}
                            variant="ghost">
                            {subItem.title}
                          </Button>
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
                className={item.isActive ? "" : "text-muted-foreground"}
                onClick={(_) => {
                  navigate(`${item.url}`);
                  setOpenMobile(false);
                }}>
                {" "}
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
