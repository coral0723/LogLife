import { BottomNav } from "../_components/BottomNav";

export default function WithNavLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-dvh">
      {children}
      <BottomNav />
    </div>
  );
}
