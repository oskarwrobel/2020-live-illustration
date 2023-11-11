import createXmlElement, { updateXmlElement } from "../createxmlelement";
import { describe, it, expect } from "vitest";

describe("createXmlElement()", () => {
  it("should create XML element by default", () => {
    const element = createXmlElement("g");

    expect(element).to.instanceof(SVGElement);
    expect(element.tagName).to.equal("g");
    expect(element.getAttributeNames()).to.length(0);
  });

  it("should create element with custom namespace", () => {
    const element = createXmlElement("div", {}, "http://www.w3.org/1999/xhtml");

    expect(element).to.instanceof(HTMLElement);
    expect(element.tagName).to.equal("DIV");
    expect(element.getAttributeNames()).to.length(0);
  });

  it("should create XML element with attributes", () => {
    const element = createXmlElement("g", {
      id: "something",
      foo: "bar",
      class: "foo bar",
    });

    expect(element.getAttributeNames()).to.have.members(["id", "foo", "class"]);
    expect(element.id).to.equal("something");
    expect(element.getAttribute("foo")).to.equal("bar");
    expect(element.classList).to.length(2);
    expect(element.classList.contains("foo")).to.true;
    expect(element.classList.contains("bar")).to.true;
  });
});

describe("updateXmlElement", () => {
  it("should update element attributes", () => {
    const element = createXmlElement("g", {
      foo: "bar",
      bar: "biz",
    });

    updateXmlElement(element, { foo: "biz", a: "b" });

    expect(element.getAttributeNames()).to.have.members(["foo", "bar", "a"]);
    expect(element.getAttribute("foo")).to.equal("biz");
    expect(element.getAttribute("bar")).to.equal("biz");
    expect(element.getAttribute("a")).to.equal("b");
  });
});
