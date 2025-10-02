export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-page">
      <div className="auth-card">{children}</div>
    </div>
  );
}
