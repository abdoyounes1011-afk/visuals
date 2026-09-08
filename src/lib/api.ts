/**
 * Safe API request utility for Fawzy AI
 * Prevents "Unexpected token 'A', 'A server e'... is not valid JSON" errors
 * by safely reading responses and converting server errors/HTML into clean messages.
 */

export interface SafeApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  isFallback?: boolean;
}

export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<SafeApiResponse<T>> {
  try {
    const response = await fetch(url, options);
    const rawText = await response.text();

    let parsedJson: any = null;
    if (rawText && rawText.trim().length > 0) {
      try {
        parsedJson = JSON.parse(rawText);
      } catch {
        // Response is plain text or HTML (e.g. "A server error occurred" or proxy error)
        parsedJson = null;
      }
    }

    if (!response.ok) {
      let errorMessage = parsedJson?.error || parsedJson?.message;
      if (!errorMessage) {
        if (!rawText || rawText.toLowerCase().includes("server error") || rawText.trim().startsWith("<")) {
          errorMessage = "تعذر استلام الرد من الخادم بشكل مؤقت، يرجى المحاولة مرة أخرى.";
        } else {
          errorMessage = rawText.slice(0, 150);
        }
      }
      return {
        ok: false,
        status: response.status,
        error: errorMessage,
        data: parsedJson,
      };
    }

    if (parsedJson === null) {
      return {
        ok: false,
        status: response.status,
        error: "استجاب الخادم بتنسيق غير متوقع، يرجى المحاولة مرة أخرى.",
      };
    }

    return {
      ok: true,
      status: response.status,
      data: parsedJson,
      isFallback: Boolean(parsedJson?.isFallback),
    };
  } catch (networkError: any) {
    console.error(`Network error when requesting ${url}:`, networkError);
    return {
      ok: false,
      status: 0,
      error: networkError?.message || "تعذر الاتصال بالخادم، يرجى التأكد من اتصال الإنترنت وإعادة المحاولة.",
    };
  }
}
