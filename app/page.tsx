import { redirectToStaticHtml } from './_lib/redirectToStatic';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Page({ searchParams }: Props) {
  redirectToStaticHtml('/index.html', await searchParams);
  return null;
}
