export type Field = {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
};

export const Detail = ({ label, value, highlight = false }: Field) => (
  <div className="">
    <div className="text-sm text-muted-foreground italic">{label}</div>
    <div
      className={`whitespace-pre-line break-words ${
        highlight ? "text-green-400 font-semibold" : "text-white"
      }`}>
      {value}
    </div>
  </div>
);
