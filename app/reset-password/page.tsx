import ResetPasswordPageClient from "./ResetPasswordPageClient";

export const metadata = { title: "Reset Password — Planty" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  return <ResetPasswordPageClient token={params.token ?? ""} />;
}