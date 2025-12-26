import { redirect } from 'next/navigation';

export function redirectToStaticHtml(htmlPath: string, searchParams?: Record<string, string | string[] | undefined>) {
  const qs = searchParams ? new URLSearchParams(
    Object.entries(searchParams).flatMap(([k, v]) => {
      if (v === undefined) return [];
      if (Array.isArray(v)) return v.map((vv) => [k, String(vv)] as [string, string]);
      return [[k, String(v)]];
    })
  ).toString() : '';

  const target = qs ? `${htmlPath}?${qs}` : htmlPath;
  redirect(target);
}
