export const consumeSingleEvent = async <E = Event>(eventName: string, predicate?: (event: E) => boolean): Promise<E> => {
  return await new Promise((resolve) => {
    const listener = (
      (e: E) => {
        if (!predicate || predicate(e)) {
          document.removeEventListener(eventName, listener);
          resolve(e);
        }
      }
    ) as EventListener;
    document.addEventListener(eventName, listener);
  })
}

export interface AsyncEventListener {
  (evt: Event): Promise<void>;
}
