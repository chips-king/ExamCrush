export async function readJsonResponse(response: Response) {
  const text = await response.text();

  if (!text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      error: response.ok ? "响应不是有效 JSON。" : text.slice(0, 300)
    };
  }
}
