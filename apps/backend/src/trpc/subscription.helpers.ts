export async function* forwardSubscription<T>(
  source: AsyncIterable<T>,
): AsyncGenerator<T, void, void> {
  for await (const item of source) {
    yield item;
  }
}
