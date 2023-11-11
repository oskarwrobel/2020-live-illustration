import Scenes from "../scenes";
import { describe, it, vi, beforeEach, expect } from "vitest";

describe("Scenes", () => {
  let element: HTMLElement;

  vi.useFakeTimers();

  function mockWindowSize(innerWidth: number, innerHeight: number) {
    Object.defineProperty(window, "innerWidth", { value: innerWidth });
    Object.defineProperty(window, "innerHeight", { value: innerHeight });
  }

  beforeEach(() => {
    element = document.createElement("div");
  });

  describe("constructor()", () => {
    it("should create instance", () => {
      const scenes = new Scenes(element, "1:1");

      expect(scenes.element).to.equal(element);
      expect(scenes.proportions).to.equal("1:1");
      expect(scenes.current).to.undefined;

      scenes.destroy();
    });

    it("should set size to element and update it with throttle after resize", () => {
      mockWindowSize(1000, 1500);

      const scenes = new Scenes(element, "1:1");

      expect(scenes.element.style.width).to.equal("1000px");
      expect(scenes.element.style.height).to.equal("1000px");

      mockWindowSize(1100, 1500);
      window.dispatchEvent(new Event("resize"));

      expect(scenes.element.style.width).to.equal("1100px");
      expect(scenes.element.style.height).to.equal("1100px");

      mockWindowSize(1200, 1500);
      window.dispatchEvent(new Event("resize"));
      vi.advanceTimersByTime(50);

      expect(scenes.element.style.width).to.equal("1100px");
      expect(scenes.element.style.height).to.equal("1100px");

      vi.advanceTimersByTime(50);
      expect(scenes.element.style.width).to.equal("1200px");
      expect(scenes.element.style.height).to.equal("1200px");

      scenes.destroy();
    });

    it("should set size to element and update it after orientation change", () => {
      mockWindowSize(1000, 1500);

      const scenes = new Scenes(element, "1:1");

      expect(scenes.element.style.width).to.equal("1000px");
      expect(scenes.element.style.height).to.equal("1000px");

      mockWindowSize(1100, 1500);
      window.dispatchEvent(new Event("orientationchange"));

      expect(scenes.element.style.width).to.equal("1100px");
      expect(scenes.element.style.height).to.equal("1100px");

      scenes.destroy();
    });

    it("should show scene on popstate change", () => {
      const scenes = new Scenes(element, "1:1");

      scenes.add("scene-1", {
        path: "/scene-1",
        creator: vi.fn(() => vi.fn()),
      });

      expect(scenes.current).to.undefined;

      window.dispatchEvent(
        new PopStateEvent("popstate", {
          state: {
            path: "/scene-1",
          },
        }),
      );

      vi.advanceTimersByTime(160);

      expect(scenes.current.name).to.equal("scene-1");

      scenes.destroy();
    });
  });

  describe("add() / has()", () => {
    it("should add new scene under the name and path name", () => {
      const scenes = new Scenes(element, "1:1");

      scenes.add("scene-1", {
        path: "/scene-1-path",
        creator: vi.fn(),
      });

      expect(scenes.has("scene-1")).to.true;
      expect(scenes.has("/scene-1-path")).to.true;
      expect(scenes.has("undefined-scene")).to.false;
      expect(scenes.has("/undefined-scene-path")).to.false;

      scenes.destroy();
    });

    it("should throw when scene with the same name has been already added", () => {
      const scenes = new Scenes(element, "1:1");

      scenes.add("scene-1", {
        path: "/scene-1-path",
        creator: vi.fn(),
      });

      expect(() => {
        scenes.add("scene-1", {
          path: "/scene-2-path",
          creator: vi.fn(),
        });
      }).to.throw(Error, "Scene with the same name already created.");

      scenes.destroy();
    });

    it("should throw when scene with the same path has been already added", () => {
      const scenes = new Scenes(element, "1:1");

      scenes.add("scene-1", {
        path: "/scene-1-path",
        creator: vi.fn(),
      });

      expect(() => {
        scenes.add("scene-2", {
          path: "/scene-1-path",
          creator: vi.fn(),
        });
      }).to.throw(Error, "Scene with the same path already created.");

      scenes.destroy();
    });
  });

  describe("show()", () => {
    it("should be rejected when scene is not defined", async () => {
      const scenes = new Scenes(element, "1:1");

      let error: Error;

      try {
        await scenes.show("something");
      } catch (err) {
        error = err;
      }

      expect(error).to.instanceof(Error);
      expect(error.message).to.equal("Scene does not exist.");

      scenes.destroy();
    });

    it("should show initial scene using scene name", async () => {
      const scenes = new Scenes(element, "1:1");
      const destructorSpy = vi.fn();
      const creatorSpy = vi.fn().mockReturnValue(destructorSpy);

      scenes.add("scene-1", {
        path: "/scene-1-path",
        creator: creatorSpy,
      });

      scenes.show("scene-1");
      await vi.runAllTimersAsync();

      expect(scenes.current.name).to.equal("scene-1");
      expect(element.classList.contains("scene-scene-1"));
      expect(creatorSpy.mock.calls.length).equal(1);
      expect(destructorSpy.mock.calls.length).equal(0);

      scenes.destroy();
    });

    it("should show initial scene using scene path", async () => {
      const scenes = new Scenes(element, "1:1");
      const destructorSpy = vi.fn();
      const creatorSpy = vi.fn().mockReturnValue(destructorSpy);

      scenes.add("scene-1", {
        path: "/scene-1-path",
        creator: creatorSpy,
      });

      scenes.show("/scene-1-path");
      await vi.runAllTimersAsync();

      expect(scenes.current.name).to.equal("scene-1");
      expect(element.classList.contains("scene-scene-1"));
      expect(creatorSpy.mock.calls.length).equal(1);
      expect(destructorSpy.mock.calls.length).equal(0);

      scenes.destroy();
    });

    it("should switch scenes using scene name", async () => {
      const scenes = new Scenes(element, "1:1");
      const destructor1Spy = vi.fn();
      const destructor2Spy = vi.fn();
      const creator1Spy = vi.fn().mockReturnValue(destructor1Spy);
      const creator2Spy = vi.fn().mockReturnValue(destructor2Spy);

      scenes.add("scene-1", {
        path: "/scene-1-path",
        creator: creator1Spy,
      });

      scenes.add("scene-2", {
        path: "/scene-2-path",
        creator: creator2Spy,
      });

      scenes.show("scene-1");
      await vi.runAllTimersAsync();

      scenes.show("scene-2");
      await vi.runAllTimersAsync();

      expect(scenes.current.name).to.equal("scene-2");
      expect(element.classList.contains("scene-scene-1")).to.false;
      expect(element.classList.contains("scene-scene-2")).to.true;
      expect(destructor1Spy.mock.calls.length).equal(1);
      expect(destructor2Spy.mock.calls.length).equal(0);

      scenes.destroy();
    });
  });

  describe("destroy()", () => {
    it("should clear proportions from element", () => {
      const scenes = new Scenes(element, "1:1");

      expect(element.style.width).to.not.empty;
      expect(element.style.height).to.not.empty;

      scenes.destroy();

      expect(element.style.width).to.empty;
      expect(element.style.height).to.empty;

      window.dispatchEvent(new Event("orientationchange"));
      window.dispatchEvent(new Event("resize"));

      expect(element.style.width).to.empty;
      expect(element.style.height).to.empty;
    });
  });

  it("should not react on popstate", () => {
    const scenes = new Scenes(element, "1:1");

    scenes.add("scene-1", {
      path: "/scene-1",
      creator: vi.fn().mockReturnValue(vi.fn()),
    });

    scenes.destroy();

    window.dispatchEvent(
      new PopStateEvent("popstate", {
        state: {
          path: "/scene-1",
        },
      }),
    );

    vi.advanceTimersByTime(160);

    expect(scenes.current).to.undefined;
  });

  it("should clear current scene", async () => {
    const scenes = new Scenes(element, "1:1");
    const destructorSpy = vi.fn();
    const creatorSpy = vi.fn().mockReturnValue(destructorSpy);

    scenes.add("scene-1", {
      path: "/scene-1",
      creator: creatorSpy,
    });

    scenes.show("scene-1");
    await vi.runAllTimersAsync();

    expect(scenes.current.name).to.equal("scene-1");

    scenes.destroy();

    expect(scenes.current).to.null;
    expect(destructorSpy.mock.calls.length).equal(1);
  });
});
