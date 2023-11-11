import createSvgElement from "../createsvgelement";
import { describe, it, expect } from "vitest";

describe("createSvgElement", () => {
  const svgRawData = "<svg><g></g></svg>";

  it("should create SVG element from string", () => {
    const svg = createSvgElement(svgRawData);

    expect(svg.tagName).to.equal("svg");
    expect(svg.innerHTML).to.equal("<g/>");
  });

  it("should create SVG element with id attribute", () => {
    const svg = createSvgElement(svgRawData, { id: "something" });

    expect(svg.id).to.equal("something");
  });

  it("should create SVG element with class attribute", () => {
    const svg = createSvgElement(svgRawData, { class: "foo bar" });

    expect(svg.classList.contains("foo")).to.true;
    expect(svg.classList.contains("bar")).to.true;
  });

  it("should append element to the given container", () => {
    const parent = document.createElement("div");
    const svg = createSvgElement(svgRawData, {}, parent);

    expect(svg.parentNode).to.equal(parent);
  });
});
