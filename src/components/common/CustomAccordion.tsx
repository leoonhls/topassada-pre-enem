import { cn, isAdm } from "@/utils/utils";
import {
  ArrowRight,
  ChevronDownIcon,
  ChevronUpIcon,
  MapPin,
  Package,
  Users,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Detail, Field } from "./Detail";

// Tipo genérico para itens do accordion
interface AccordionItem {
  id: string | number;
  header: {
    title: string;
    subtitle?: string;
    rightContent?: ReactNode;
  };
  content?: ReactNode; // Conteúdo customizado
  fields?: Field[]; // Para backward compatibility
  isSelected?: boolean;
}

// Props para o accordion
type AccordionProps = {
  // Modo single item (backward compatibility)
  title?: ReactNode;
  productName?: ReactNode;
  staffNames?: string[];
  currency?: string;
  quantity?: number;
  tags?: { label: string; value: string }[];
  productOrigin?: string;
  productDestination?: string;
  fields?: Field[];
  actions?: ReactNode;
  unit?: string;

  // Modo múltiplos itens
  items?: AccordionItem[];
  expandedItemId?: string | number | null;
  onToggleExpand?: (id: string | number) => void;

  // Estilo
  className?: string;
  multipleItems?: boolean;
};

export function CustomAccordion({
  // Props do modo single
  title,
  productName,
  staffNames,
  currency,
  quantity,
  tags,
  unit,
  productOrigin,
  productDestination,
  fields = [],
  actions,

  // Props do modo múltiplo
  items = [],
  expandedItemId,
  onToggleExpand,

  // Props de estilo
  className = "",
  multipleItems = false,
}: AccordionProps) {
  const [internalExpandedId, setInternalExpandedId] = useState<
    string | number | null
  >(null);

  // Se não for modo múltiplo, usar estado interno para single item
  const [singleItemExpanded, setSingleItemExpanded] = useState(false);

  const toggleExpand = (id?: string | number) => {
    if (multipleItems && id !== undefined) {
      if (onToggleExpand) {
        onToggleExpand(id);
      } else {
        setInternalExpandedId(internalExpandedId === id ? null : id);
      }
    } else {
      setSingleItemExpanded(!singleItemExpanded);
    }
  };

  const isExpanded = (id?: string | number) => {
    if (multipleItems && id !== undefined) {
      return expandedItemId !== undefined
        ? expandedItemId === id
        : internalExpandedId === id;
    }
    return singleItemExpanded;
  };

  // Renderizar single item (backward compatibility)
  if (!multipleItems && title) {
    return (
      <Card
        className={cn(
          "transition-all duration-200 hover:shadow-md cursor-default",
          "hover:scale-[1.01] hover:border-primary/20",
          className,
        )}>
        <CardHeader
          className="flex items-center justify-between p-4"
          onClick={() => toggleExpand()}>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 font-medium text-foreground">
                  {<Badge variant="default">{title}</Badge>}
                  {<Badge variant="outline">{productName}</Badge>}
                </div>
                {
                  <div className="flex gap-1 items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {staffNames?.join(" | ")}
                  </div>
                }
              </div>
              <div className="flex flex-col gap-2 justify-end text-sm">
                {currency}
                <div className="flex gap-1 text-right justify-end items-center">
                  <Package className="w-4 h-4" />
                  {quantity}
                  {` ${unit || ""}s`}
                </div>
              </div>
            </div>
          </div>
          <div className="ml-4">
            {isExpanded() ? (
              <ChevronUpIcon className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        {isExpanded() && (
          <CardContent className="pt-0">
            <div className="flex flex-col gap-4 p-4 border-t border-border">
              {fields.length > 0 && (
                <div className="flex flex-wrap gap-x-20 gap-y-5 justify-between">
                  {fields.map((field, idx) => (
                    <Detail
                      key={idx}
                      label={field.label}
                      value={field.value}
                      highlight={field.highlight}
                    />
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between flex-1/2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium ">
                      {productOrigin}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2 flex-1/2 justify-end">
                  <MapPin className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium">
                    {productDestination}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-6 justify-between">
              <div className="flex gap-1">
                {tags &&
                  tags.map((item, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="flex items-center gap-1">
                      {`${item.label}: ${item.value}`}
                    </Badge>
                  ))}
              </div>
              {actions && (
                <div className="flex justify-end mx-2 text-sm">{actions}</div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  // Renderizar múltiplos itens
  return (
    <div className={`space-y-2 transition-all duration-300 ${className}`}>
      {items.map((item) => {
        const itemIsExpanded = isExpanded(item.id);
        return (
          <div
            key={item.id}
            className={`border rounded-lg overflow-hidden transition-all duration-300  ${
              item.isSelected
                ? "border-primary bg-primary/10"
                : "border-border bg-card"
            }`}>
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => toggleExpand(item.id)}>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">
                      {item.header.title}
                    </h3>
                    {item.header.subtitle && (
                      <p className="text-sm text-muted-foreground">
                        {item.header.subtitle}
                      </p>
                    )}
                  </div>
                  <div className="text-right">{item.header.rightContent}</div>
                </div>
              </div>
              <div className="ml-4 transition-all duration-300 ">
                {itemIsExpanded ? (
                  <ChevronUpIcon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
            <div
              className={`transition-all duration-200 overflow-hidden  border-t border-border bg-card ${
                itemIsExpanded
                  ? "max-h-[1000px] opacity-100 p-4"
                  : "max-h-0 opacity-0 p-0 border-t-0 px-50"
              }`}
              style={{
                // maxHeight for transition, 1000px is arbitrary large value
                transitionProperty: "max-height, opacity, padding",
              }}>
              {/* Conteúdo customizado */}
              {item.content}

              {/* Fallback para fields (backward compatibility) */}
              {item.fields && item.fields.length > 0 && (
                <div
                  className="grid auto-rows-auto gap-4 items-start"
                  style={{
                    gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                  }}>
                  {item.fields.map((field, idx) => (
                    <Detail
                      key={idx}
                      label={field.label}
                      value={field.value}
                      highlight={field.highlight}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
CustomAccordion.displayName = "CustomAccordion";
