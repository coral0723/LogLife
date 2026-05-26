import { BottomNav } from "../_components/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[100dvh]">
      {children}
      <BottomNav />
    </div>
  );
}
