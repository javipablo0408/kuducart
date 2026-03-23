export async function httpClient<T>(
  input: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(input, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
  }

  return (await response.json()) as T;
}
