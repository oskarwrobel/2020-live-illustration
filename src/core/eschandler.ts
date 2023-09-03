export default function escHandler(
  callback: (evt: KeyboardEvent) => void,
): () => void {
  function handler(evt: KeyboardEvent): void {
    if (evt.key === "Escape") {
      callback(evt);
    }
  }

  document.addEventListener("keydown", handler);

  return function destructor(): void {
    document.removeEventListener("keydown", handler);
  };
}
