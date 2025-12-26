import { redirectToStaticHtml } from '../_lib/redirectToStatic';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Page({ searchParams }: Props) {
  redirectToStaticHtml('/reset-password.html', await searchParams);
}
