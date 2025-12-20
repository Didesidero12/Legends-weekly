'use client';

// This layout is intentionally simple.
// The FirebaseClientProvider is now in the root layout,
// so this layout doesn't need to do anything special.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
