import { gsap } from "gsap";
import { throttle, clamp } from "lodash-es";

type Item = {
  element: Element;
  depth: number;
};

type Config = {
  scene: Element;
  items: Item[];
};

// Value from 0 - 100 defines how big shift the deepest plan should do.
const sensitivity = 6;

export default function parallax(config: Config): () => void {
  let sceneRect: DOMRect;
  let moveRange: number;
  let lastValue: number;

  updateRects();

  config.scene.classList.add("parallax");

  const throttledMouseMoveHandler = throttle(mouseMoveHandler, 50, {
    leading: true,
  });
  const throttledUpdateRects = throttle(updateRects, 100, { leading: false });

  document.addEventListener("mousemove", throttledMouseMoveHandler);
  window.addEventListener("resize", throttledUpdateRects);

  function mouseMoveHandler(evt: MouseEvent): void {
    requestAnimationFrame(() => {
      const center = sceneRect.width / 2;
      const distanceFromCenter = ((evt.clientX - sceneRect.left) * 100) / center - 100;
      const direction = distanceFromCenter < 0 ? -1 : 1;
      const value = (clamp(Math.abs(distanceFromCenter), 0, 100) * moveRange) / 100;

      move(value * direction);
    });
  }

  function updateRects(): void {
    sceneRect = config.scene.getBoundingClientRect();
    moveRange = (sceneRect.width * sensitivity) / 100;
  }

  function move(value: number): void {
    if (lastValue === value) {
      return;
    }

    lastValue = value;

    for (const item of config.items) {
      const element = item.element as HTMLElement;
      const x = -value * item.depth;

      gsap.to(element, { x, overwrite: true });
    }
  }

  return function destroy(): void {
    document.removeEventListener("mousemove", throttledMouseMoveHandler);
    window.removeEventListener("resize", throttledUpdateRects);
    config.scene.classList.remove("parallax");
  };
}
