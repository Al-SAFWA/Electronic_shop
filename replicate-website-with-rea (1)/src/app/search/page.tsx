import CollectionView from "@/components/CollectionView";
import { getI18n } from "@/lib/lang";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const { l } = await getI18n();
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";
  return (
    <CollectionView
      category="all"
      q={q}
      title={q ? `${l("نتائج", "Résultats pour")} «${q}»` : l("بحث", "Recherche")}
      searchParams={sp}
      basePath="/search"
    />
  );
}
