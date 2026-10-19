import { notFound } from "next/navigation";
import CollectionView from "@/components/CollectionView";
import { getI18n } from "@/lib/lang";
import { CATEGORIES } from "@/lib/options";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { l, tv } = await getI18n();
  const name = tv("cat", slug);
  return { title: `${name} ${l("مجددة ومعتمدة", "reconditionnés certifiés")} | Loopt` };
}

export default async function Collection({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const { l, tv } = await getI18n();
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (slug !== "all" && !cat) notFound();
  return (
    <CollectionView
      category={slug}
      title={cat ? `${tv("cat", slug)} ${l("مجددة ومعتمدة", "reconditionnés certifiés")}` : l("كل الأجهزة", "Tous les appareils")}
      searchParams={sp}
      basePath={`/collections/${slug}`}
    />
  );
}
