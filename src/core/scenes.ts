import { throttle } from "lodash-es";
import setProportions from "./setproportions";

export type SceneCreator = (scenes: Scenes) => SceneDestructor;
export type SceneDestructor = () => void;
export type SceneConfig = {
  creator: SceneCreator;
  path: string;
};

/**
 * Creates, destroys and switches between scenes.
 */
export default class Scenes {
  private readonly _nameToScene: Map<string, Scene> = new Map();
  private readonly _pathToScene: Map<string, Scene> = new Map();
  readonly element: HTMLElement;
  readonly proportions: string;
  current: Scene;

  private _resizeHandler = (): void => setProportions(this.element, this.proportions);
  private _throttledResizeHandler = throttle(this._resizeHandler, 100, {
    leading: true,
  });
  private _popstateHandler = (evt: PopStateEvent): Promise<void> => this._show(evt.state.path);

  constructor(element: HTMLElement, proportions: string) {
    this.element = element;
    this.proportions = proportions;

    // Keeps proper proportions.
    window.addEventListener("resize", this._throttledResizeHandler);
    window.addEventListener("orientationchange", this._resizeHandler);
    setProportions(element, proportions);

    // Change illustration on browser back button.
    window.addEventListener("popstate", this._popstateHandler);
  }

  add(name: string, config: SceneConfig): Scenes {
    if (this._nameToScene.has(name)) {
      throw new Error("Scene with the same name already created.");
    }

    if (this._pathToScene.has(config.path)) {
      throw new Error("Scene with the same path already created.");
    }

    const scene = new Scene(name, config);

    this._nameToScene.set(name, scene);
    this._pathToScene.set(config.path, scene);

    return this;
  }

  has(nameOrPath: string): boolean {
    return this._nameToScene.has(nameOrPath) || this._pathToScene.has(nameOrPath);
  }

  async show(nameOrPath: string): Promise<void> {
    await this._show(nameOrPath);
    this._updateUrl(this.current.path);
  }

  private async _show(nameOrPath: string): Promise<void> {
    const scene = this._nameToScene.get(nameOrPath) || this._pathToScene.get(nameOrPath);

    if (!scene) {
      throw new Error("Scene does not exist.");
    }

    if (this.current) {
      this.element.classList.add("changing");
      await wait(80);
      this._detachCurrentScene();
    }

    this.current = scene;
    this.element.classList.add("scene-" + this.current.name);
    this.current.render(this);
    await wait(80);
    this.element.classList.remove("changing");
  }

  private _detachCurrentScene(): void {
    this.current.detach();
    this.element.innerHTML = "";
    this.element.classList.remove("scene-" + this.current.name);
    this.current = null;
  }

  private _updateUrl(path: string): void {
    history.pushState({ path }, "", window.location.pathname + "#" + path);
  }

  destroy(): void {
    window.removeEventListener("resize", this._throttledResizeHandler);
    window.removeEventListener("orientationchange", this._resizeHandler);
    window.removeEventListener("popstate", this._popstateHandler);

    this.element.style.width = null;
    this.element.style.height = null;

    if (this.current) {
      this._detachCurrentScene();
    }
  }
}

/**
 * Single scene representation.
 */
export class Scene {
  readonly name: string;
  readonly path: string;
  data: any = {};
  private readonly _creator: SceneCreator;
  private _destructor: SceneDestructor;

  constructor(name: string, config: SceneConfig) {
    this.name = name;
    this.path = config.path;
    this._creator = config.creator;
  }

  render(scenes: Scenes): void {
    this._destructor = this._creator(scenes);
  }

  detach(): void {
    this._destructor();
  }
}

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
