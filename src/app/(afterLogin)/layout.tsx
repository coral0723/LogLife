import RQProviders from "./_components/RQProviders";

export default function AfterLoginLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <RQProviders>
      {modal}
      {children}
    </RQProviders>
  );
}
