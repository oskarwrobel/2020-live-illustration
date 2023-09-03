import createXmlElement, { updateXmlElement } from "./createxmlelement";

type Config = {
  source: string;
  targets: string[];
};

/**
 * This is a helper function that creates clipPath element for `targets` elements using `source` shape.
 * Source element is wrapped into clip path, so it should be created explicit for this.
 *
 * There is a huge mess with clip paths created by Adobe Illustrator, after hours or even days of fighting
 * with it I found this solution and don't want to dig more now :)
 */
export default function createClipPathElement(
  config: Config,
): SVGClipPathElement {
  const id = toHashLike(config.source);
  const clipPathElement = createXmlElement("clipPath", {
    id,
  }) as SVGClipPathElement;
  const source = document.querySelector(config.source);

  source.removeAttribute("id");
  source.parentNode.insertBefore(clipPathElement, source);
  clipPathElement.appendChild(source);

  for (const target of config.targets) {
    updateXmlElement(document.querySelector(target), {
      "clip-path": `url(${"#" + id})`,
    });
  }

  return clipPathElement;
}

function toHashLike(value: string): string {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return "e" + hash;
}
