import { StoredQuestionsClient } from "@/components/StoredQuestionsClient";
import { PageTitle } from "@/components/ui";

export default function FavoritesPage() {
  return (
    <div>
      <PageTitle
        eyebrow="Saved"
        title="收藏"
        description="这里显示当前浏览器收藏过的题目。"
      />
      <StoredQuestionsClient
        storageKey="examcrush:favorites"
        emptyText="还没有收藏题目。"
      />
    </div>
  );
}
