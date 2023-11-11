import { gsap } from "gsap";
import { random } from "lodash-es";
import { openBlinds, closeBlinds } from "./toggleblinds";
import Scenes from "../../../core/scenes";
import sendEvent from "../../../core/sendevent";

type Side = -1 | 1;

type Range = [number, number];

type AnimationConfig = {
  from: { x: number; y: number; scale: number };
  to: { x: number; y: number; scale: number };
  duration: number;
  delay?: number;
  progress?: number;
  onProgress?: (value: number) => void;
};

type AnimationInLoopConfig = {
  duration: Range;
  scale: Range;
  delay?: Range;
  progress?: Range;
};

type TransformConfig = {
  x: Side; // New position should be moved before (-1) or after (+1) rect in x axis.
  y: number; // Shift in y axis relative to top bound.
  scale: number; // Element scale, needed to calculate x and y position.
};

type TransformedPosition = {
  x: number;
  y: number;
  scale: number;
};

const hashTags = ["#StayHome", "#QuarantineAndChill", "#WashYourHands", "#CallMom", "#StayHydrated"];

let isLoopAnimationInProgress = false;

// Window rect. Cashed for optimization purpose.
let windowRect: SVGRect;

// To avoid clouds overlapping the window area is split into levels.
// Each cloud has move only on the available level. When cloud is in the middle of the
// window width then the level is released and next cloud is allowed to move at the same level.
const levelTopEdge = 140;
const levelHeight = 150;
const maxLevels = 3;
const cloudToLevel: Map<SVGGElement, number> = new Map();

// Two separate planes (svg groups) are used to pretend one plane flying two ways.
// This variable represents the currently visible plane element.
let currentPlane: SVGGElement;

// Stores all pending animations.
const elementToAnimation: Map<SVGGElement, gsap.core.Tween> = new Map();

export default function windowWithBlinds(scenes: Scenes): () => void {
  windowRect = (document.querySelector("#window-frame") as SVGRectElement).getBBox();

  const blinds: SVGGElement[] = Array.from(document.querySelectorAll("#blinds > g"));
  const rightToLeftPlane = document.querySelector("#plane-1") as SVGGElement;
  const leftToRightPlane = document.querySelector("#plane-2") as SVGGElement;
  const cloud1 = document.querySelector("#cloud-1") as SVGGElement;
  const cloud2 = document.querySelector("#cloud-2") as SVGGElement;
  const cloud3 = document.querySelector("#cloud-3") as SVGGElement;

  if (scenes.current.data.areBlindsOpen) {
    openBlinds(blinds);
    startAnimation([rightToLeftPlane, leftToRightPlane, cloud1, cloud2, cloud3]);
    sendEvent("blinds", "open", "init");
  }

  document.querySelector("#blinds").addEventListener("click", () => {
    if (!scenes.current.data.areBlindsOpen) {
      scenes.current.data.areBlindsOpen = true;
      openBlinds(blinds);

      // When there are already pending animations it means blinds weren't fully closed before opening.
      // It may happen when someone toggles blinds in a short amount of time.
      if (!isLoopAnimationInProgress) {
        startAnimation([rightToLeftPlane, leftToRightPlane, cloud1, cloud2, cloud3]);
      }

      sendEvent("blinds", "open", "click");
    } else {
      scenes.current.data.areBlindsOpen = false;
      closeBlinds(blinds).then(stopAnimation);
      sendEvent("blinds", "close", "click");
    }
  });

  return function windowWithBlindsDestructor(): void {
    stopAnimation();
    elementToAnimation.clear();
    cloudToLevel.clear();
    currentPlane = null;
    isLoopAnimationInProgress = false;
  };
}

function startAnimation([rightToLeftPlane, leftToRightPlane, cloud1, cloud2, cloud3]: SVGGElement[]): void {
  isLoopAnimationInProgress = true;

  const planes = [rightToLeftPlane, leftToRightPlane];

  currentPlane = planes[random(0, 1)];
  animatePlaneInLoop(planes, {
    duration: [10, 15],
    delay: [3, 6],
    scale: [0.5, 1],
    progress: [0, 0.7],
  });

  // Reserve cloud levels before animations are started to be sure each cloud will move on a separate level.
  // Otherwise one animation may reserve cloud level and immediately release it because random progress
  // may start after a half.
  getAvailableCloudLevel(cloud1);
  getAvailableCloudLevel(cloud2);
  getAvailableCloudLevel(cloud3);

  animateCloudInLoop(cloud1, {
    duration: [34, 40],
    progress: [0.1, 0.3],
    scale: [0.7, 1],
  });
  animateCloudInLoop(cloud2, {
    duration: [20, 28],
    progress: [0.5, 0.7],
    scale: [0.7, 1],
  });
  animateCloudInLoop(cloud3, {
    duration: [28, 34],
    progress: [0.3, 0.5],
    scale: [0.7, 1],
  });
}

function stopAnimation(): void {
  isLoopAnimationInProgress = false;

  for (const animation of elementToAnimation.values()) {
    animation.progress(1);
    animation.kill();
  }

  elementToAnimation.clear();
  cloudToLevel.clear();
}

function animatePlaneInLoop(planes: SVGGElement[], config: AnimationInLoopConfig): void {
  if (!isLoopAnimationInProgress) {
    return;
  }

  const [rightToLeftPlane, leftToRightPlane] = planes;
  const randomHashTag = hashTags[random(0, hashTags.length - 1)];
  const scale = rangeToValue(config.scale);

  const initialYPosition = getRandomY(currentPlane);
  let initialXPosition: Side;

  if (currentPlane === leftToRightPlane) {
    currentPlane = rightToLeftPlane;
    initialXPosition = 1;
  } else {
    currentPlane = leftToRightPlane;
    initialXPosition = -1;
  }

  setBannerText(currentPlane, randomHashTag, currentPlane === leftToRightPlane);

  animateElement(currentPlane, {
    from: transformElementByRect(currentPlane, windowRect, {
      scale,
      x: initialXPosition,
      y: initialYPosition,
    }),
    to: transformElementByRect(currentPlane, windowRect, {
      scale,
      x: (initialXPosition * -1) as Side,
      y: initialYPosition,
    }),
    delay: rangeToValue(config.delay),
    duration: rangeToValue(config.duration),
    progress: rangeToValue(config.progress),
  }).then(() => {
    animatePlaneInLoop(planes, {
      duration: config.duration,
      delay: config.delay,
      scale: config.scale,
    });
  });
}

function animateCloudInLoop(element: SVGGElement, config: AnimationInLoopConfig): void {
  if (!isLoopAnimationInProgress) {
    return;
  }

  const scale = rangeToValue(config.scale);
  const level = getAvailableCloudLevel(element);
  let levelIsReleased = false;

  const initialXPosition = 1;
  const initialYPosition = getRandomY(element, level);

  animateElement(element, {
    from: transformElementByRect(element, windowRect, {
      scale,
      x: initialXPosition,
      y: initialYPosition,
    }),
    to: transformElementByRect(element, windowRect, {
      scale,
      x: (initialXPosition * -1) as Side,
      y: initialYPosition,
    }),
    delay: rangeToValue(config.delay),
    duration: rangeToValue(config.duration),
    progress: rangeToValue(config.progress),
    onProgress(value: number) {
      if (!levelIsReleased && value > 0.5 && value < 1) {
        releaseCloudLevel(element);
        levelIsReleased = true;
      }
    },
  }).then(() => {
    animateCloudInLoop(element, {
      duration: config.duration,
      delay: config.delay,
      scale: config.scale,
    });
  });
}

function animateElement(element: SVGGElement, config: AnimationConfig): gsap.core.Timeline {
  let onUpdate: () => void;

  if (config.onProgress) {
    onUpdate = function onProgress(): void {
      config.onProgress(this.progress());
    };
  }

  return gsap
    .timeline({
      onStart() {
        if (config.progress) {
          this.progress(config.progress);
        }

        elementToAnimation.set(element, this);
      },
      onUpdate,
      onComplete() {
        elementToAnimation.delete(element);
      },
    })
    .fromTo(
      element,
      {
        xPercent: config.from.x,
        yPercent: config.from.y,
        scale: config.from.scale,
      },
      {
        xPercent: config.to.x,
        yPercent: config.to.y,
        scale: config.to.scale,
        delay: config.delay,
        duration: config.duration,
        ease: "none",
      },
    );
}

function transformElementByRect(element: SVGGElement, rect: SVGRect, config: TransformConfig): TransformedPosition {
  const viewBox = element.viewportElement.getAttribute("viewBox").split(" ");
  const svgWidth = parseInt(viewBox[2]);
  const svgHeight = parseInt(viewBox[3]);

  const elementRect = element.getBBox();
  let relativeToSvgX: number;

  if (config.x > 0) {
    relativeToSvgX = ((rect.x + rect.width - elementRect.x) * 100) / svgWidth;
  } else {
    relativeToSvgX = ((rect.x - elementRect.width * config.scale - elementRect.x) * 100) / svgWidth;
  }

  const relativeToSvgY = ((rect.y + config.y - elementRect.y) * 100) / svgHeight;

  return {
    x: (svgWidth / elementRect.width) * relativeToSvgX,
    y: (svgHeight / elementRect.height) * relativeToSvgY,
    scale: config.scale,
  };
}

function getRandomY(element: SVGGElement, level?: number): number {
  if (level !== undefined) {
    const top = levelTopEdge + level * levelHeight;

    return random(top, top + 80);
  }

  const minY = levelTopEdge;
  const maxY = maxLevels * levelHeight + 80;

  return random(minY, maxY);
}

function rangeToValue(range: Range): number {
  if (!range) {
    return 0;
  }

  return random(...range);
}

function getAvailableCloudLevel(element: SVGGElement): number {
  if (cloudToLevel.has(element)) {
    return cloudToLevel.get(element);
  }

  const availableLevels = [];
  const usedLevels = Array.from(cloudToLevel.values());

  for (let i = 0; i < maxLevels; i++) {
    if (!usedLevels.includes(i)) {
      availableLevels.push(i);
    }
  }

  const level = availableLevels[random(1, availableLevels.length) - 1];

  cloudToLevel.set(element, level);

  return level;
}

function releaseCloudLevel(element: SVGGElement): void {
  cloudToLevel.delete(element);
}

function setBannerText(plane: SVGGElement, text: string, stickToRight = false): void {
  const elements = plane.firstChild.firstChild.childNodes as NodeList;
  const backgroundElement = elements[0] as SVGRectElement;
  const tailElement = elements[1] as SVGPolylineElement;
  const textNode = elements[2] as SVGTextElement;

  textNode.textContent = text;

  const PADDING = 20;
  const textWidth = textNode.getBBox().width + PADDING;

  backgroundElement.setAttribute("width", String(textWidth));

  // 'stickToRight' means the plane direction is 'left to right'
  // and banner should be stretched to the left, right side should stay fixed.
  if (stickToRight) {
    const leftBound = (plane.firstChild.childNodes[2] as SVGRectElement).getBBox().x;

    backgroundElement.setAttribute("x", String(leftBound - textWidth));

    // +1 to cover left stroke of background rectangle.
    movePointsToX(tailElement.points, leftBound - textWidth + 1);

    const backgroundRect = backgroundElement.getBBox();

    // Align text in the middle of the background rectangle.
    textNode.removeAttribute("transform");
    textNode.setAttribute("x", String(backgroundRect.x + 5));
    textNode.setAttribute("y", String(backgroundRect.y + 42));
  } else {
    const backgroundRect = backgroundElement.getBBox();

    // -1 to cover right stroke of background rectangle.
    movePointsToX(tailElement.points, backgroundRect.x + backgroundRect.width - 1);
  }
}

function movePointsToX(points: SVGPointList, x: number): void {
  let mostLeftPoint = points.getItem(0);

  for (let i = 0; i < points.numberOfItems; i++) {
    const point = points.getItem(i);

    if (mostLeftPoint > point) {
      mostLeftPoint = point;
    }
  }

  const shift = x - mostLeftPoint.x;

  for (let i = 0; i < points.numberOfItems; i++) {
    points.getItem(i).x += shift;
  }
}
