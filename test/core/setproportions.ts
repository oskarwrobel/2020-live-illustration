import { expect } from "chai";
import setProportions from "../../src/core/setproportions";

describe("setProportions", () => {
  const windowSpy = jest.spyOn(window, "window", "get");
  function mockWindowSize(innerWidth: number, innerHeight: number) {
    const val = { innerWidth, innerHeight } as Window & typeof global;
    windowSpy.mockReturnValue(val);
  }

  afterAll(() => {
    windowSpy.mockRestore();
  });

  describe("16:9", () => {
    it("should set a proper height to given element (according to screen size) to preserve aspect ratio", () => {
      const element = document.createElement("div");

      mockWindowSize(1280, 1000);
      setProportions(element, "16:9");

      expect(element.style.width).to.equal("1280px");
      expect(element.style.height).to.equal("720px");
    });

    it("should set a proper width to given element (according to screen size) to preserve aspect ratio", () => {
      const element = document.createElement("div");

      mockWindowSize(2000, 720);
      setProportions(element, "16:9");

      expect(element.style.width).to.equal("1280px");
      expect(element.style.height).to.equal("720px");
    });

    it("should work ok when proportions are already preserved", () => {
      const element = document.createElement("div");

      mockWindowSize(2000, 720);
      setProportions(element, "16:9");

      expect(element.style.width).to.equal("1280px");
      expect(element.style.height).to.equal("720px");
    });
  });

  describe("1:1", () => {
    it("should set a proper height to given element (according to screen size) to preserve aspect ratio", () => {
      const element = document.createElement("div");

      mockWindowSize(1500, 1000);
      setProportions(element, "1:1");

      expect(element.style.width).to.equal("1000px");
      expect(element.style.height).to.equal("1000px");
    });

    it("should set a proper width to given element (according to screen size) to preserve aspect ratio", () => {
      const element = document.createElement("div");

      mockWindowSize(1500, 1000);
      setProportions(element, "1:1");

      expect(element.style.width).to.equal("1000px");
      expect(element.style.height).to.equal("1000px");
    });

    it("should work ok when proportions are already preserved", () => {
      const element = document.createElement("div");

      mockWindowSize(1000, 1000);
      setProportions(element, "1:1");

      expect(element.style.width).to.equal("1000px");
      expect(element.style.height).to.equal("1000px");
    });
  });
});
