/**
 * Generates standard authentication headers using JWT Bearer token.
 */
export function getAuthHeaders(
    authToken?: string | null,
    customHeaders: Record<string, string> = {}
): Record<string, string> {
    const headers: Record<string, string> = { ...customHeaders };
    if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
    }
    return headers;
}
