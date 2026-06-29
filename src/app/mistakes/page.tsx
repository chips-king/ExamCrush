import { StoredQuestionsClient } from "@/components/StoredQuestionsClient";
import { PageTitle } from "@/components/ui";

export default function MistakesPage() {
  return (
    <div>
      <PageTitle
        eyebrow="Review"
        title="错题本"
        description="这里显示当前浏览器加入错题本的题目。"
      />
      <StoredQuestionsClient
        storageKey="examcrush:mistakes"
        emptyText="错题本还是空的。"
      />
    </div>
  );
}
