import toUnit from "./tounit";

const toPx = toUnit("px");

export default function setProportions(element: HTMLElement, proportions: string): void {
  const [optimalWidth, optimalHeight] = proportions.split(":");
  const ratio = parseInt(optimalWidth) / parseInt(optimalHeight);
  const maxWidth = window.innerWidth;
  const maxHeight = window.innerHeight;

  let width = maxWidth;
  let height = maxWidth / ratio;

  if (height > maxHeight) {
    width = maxHeight * ratio;
    height = maxHeight;
  }

  element.style.width = toPx(width);
  element.style.height = toPx(height);
}
