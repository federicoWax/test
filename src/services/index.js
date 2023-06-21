export const get = async (url, controller) => {
  const response = await fetch(
    url,
    {
      method: 'GET',
      signal: controller?.signal
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return response.json();
}