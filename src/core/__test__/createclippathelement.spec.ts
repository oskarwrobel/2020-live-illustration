import { describe, it, beforeEach, afterEach, expect } from "vitest";
import createClipPathElement from "../createclippathelement";
import createXmlElement from "../createxmlelement";

describe("createClipPathElement", () => {
  let sourceElement: SVGRectElement;
  let targetAElement: SVGRectElement;
  let targetBElement: SVGRectElement;

  beforeEach(() => {
    sourceElement = createXmlElement("rect", {
      id: "source",
      width: 10,
      height: 10,
      x: 5,
      y: 5,
    }) as SVGRectElement;
    targetAElement = createXmlElement("rect", {
      id: "target-a",
      width: 10,
      height: 10,
      x: 5,
      y: 5,
    }) as SVGRectElement;
    targetBElement = createXmlElement("rect", {
      id: "target-b",
      width: 10,
      height: 10,
      x: 5,
      y: 5,
    }) as SVGRectElement;

    document.body.appendChild(sourceElement);
    document.body.appendChild(targetAElement);
    document.body.appendChild(targetBElement);
  });

  afterEach(() => {
    [sourceElement, targetAElement, targetBElement].forEach((el) => el.remove());
  });

  it("should create clipPath element using given shape and applies it to given elements", () => {
    createClipPathElement({
      source: "#source",
      targets: ["#target-a", "#target-b"],
    });

    expect((sourceElement.parentNode as Element).tagName).to.equal("clipPath");
    expect((sourceElement.parentNode as Element).id).to.not.empty;
    expect(targetAElement.getAttribute("clip-path")).to.match(/^url\(#(.*)\)$/);
    expect(targetBElement.getAttribute("clip-path")).to.match(/^url\(#(.*)\)$/);
  });
});
