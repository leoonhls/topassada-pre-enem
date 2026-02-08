import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";

type CardProps = {
  title: string;
  subtitle?: string;
  fields: { label: string; value: React.ReactNode }[];
  actionsBottom?: React.ReactNode;
  actionsTop?: React.ReactNode;
};

export function CustomCard({
  title,
  fields,
  actionsBottom,
  actionsTop,
  subtitle,
}: CardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          {title}
          {actionsTop}
        </CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent
        className={`
            grid gap-x-6 gap-y-3
            grid-cols-2
            md:grid-cols-3
            lg:grid-cols-3
          `}>
        {fields.map((field, idx) => (
          <div key={idx} className="flex flex-col">
            <span className="text-muted-foreground italic text-xs truncate">
              {field.label}
            </span>
            <span className="text-foreground truncate">{field.value}</span>
          </div>
        ))}
      </CardContent>
      <CardFooter className="justify-end">{actionsBottom}</CardFooter>
    </Card>
  );
}
