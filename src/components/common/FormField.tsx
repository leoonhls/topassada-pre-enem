import React from "react";

interface FormFieldProps {
  label: string;
  colSpan: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = React.memo(
  ({ label, colSpan, children }) => (
    <div className={colSpan}>
      <label className="block mb-2 text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  ),
);
FormField.displayName = "FormField";
