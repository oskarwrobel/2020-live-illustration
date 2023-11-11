import { updateXmlElement } from "./createxmlelement";

const parser = new DOMParser();

type Attributes = {
  class?: string;
  id?: string;
};

/**
 * Creates SVG element from string data.
 */
export default function createSvgElement(rawData: string, attributes?: Attributes, appendTo?: Element): SVGElement {
  const element = parser.parseFromString(rawData, "image/svg+xml").childNodes[0] as SVGElement;

  if (attributes) {
    updateXmlElement(element, attributes);
  }

  if (appendTo) {
    appendTo.appendChild(element);
  }

  return element;
}
