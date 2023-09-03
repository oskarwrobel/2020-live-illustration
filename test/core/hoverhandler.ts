import { expect } from "chai";
import hoverHandler from "../../src/core/hoverhandler";

describe("hoverHandler", () => {
  it("should allow to attach callbacks for enter and leave events", () => {
    const element = document.createElement("div");

    const hoverSpy = jest.fn();
    const leaveSpy = jest.fn();

    hoverHandler(element, {
      enter: hoverSpy,
      leave: leaveSpy,
    });

    element.dispatchEvent(new MouseEvent("mouseenter"));
    expect(hoverSpy.mock.calls.length).equal(1);
    expect(leaveSpy.mock.calls.length).equal(0);
    expect(hoverSpy.mock.lastCall[0]).to.instanceof(MouseEvent);

    element.dispatchEvent(new MouseEvent("mouseleave"));
    expect(hoverSpy.mock.calls.length).equal(1); // Still once.
    expect(leaveSpy.mock.calls.length).equal(1);
    expect(leaveSpy.mock.lastCall[0]).to.instanceof(MouseEvent);
  });

  it("should return destructor function to detach events", () => {
    const element = document.createElement("div");

    const hoverSpy = jest.fn();
    const leaveSpy = jest.fn();

    const destructor = hoverHandler(element, {
      enter: hoverSpy,
      leave: leaveSpy,
    });

    element.dispatchEvent(new Event("mouseenter"));
    element.dispatchEvent(new Event("mouseleave"));
    expect(hoverSpy.mock.calls.length).equal(1);
    expect(leaveSpy.mock.calls.length).equal(1);

    destructor();

    element.dispatchEvent(new Event("mouseenter"));
    element.dispatchEvent(new Event("mouseleave"));
    expect(hoverSpy.mock.calls.length).equal(1); // Still once.
    expect(leaveSpy.mock.calls.length).equal(1); // Still once.
  });
});
