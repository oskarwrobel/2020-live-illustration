import { throttle } from 'lodash-es';
import setProportions from './setproportions';

export type SceneCreator = ( scenes: Scenes ) => SceneDestructor;
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
	current: Scene;

	constructor( element: HTMLElement, optimalResolution: string ) {
		this.element = element;

		const [ optimalWidth, optimalHeight ] = optimalResolution.split( 'x' ).map( value => parseInt( value ) );

		// Keeps proper proportions.
		window.addEventListener( 'resize', throttle( () => {
			setProportions( element, optimalWidth, optimalHeight );
		}, 100, { leading: true } ) );

		window.addEventListener( 'orientationchange', () => {
			setProportions( element, optimalWidth, optimalHeight );
		} );

		setProportions( element, optimalWidth, optimalHeight );

		window.addEventListener( 'popstate', ( evt: PopStateEvent ) => {
			this._show( evt.state.path );
		} );
	}

	add( name: string, config: SceneConfig ): Scenes {
		if ( this._nameToScene.has( name ) ) {
			throw new Error( 'Scene with the same name already created.' );
		}

		if ( this._pathToScene.has( config.path ) ) {
			throw new Error( 'Scene with the same path already created.' );
		}

		const scene = new Scene( name, config );

		this._nameToScene.set( name, scene );
		this._pathToScene.set( config.path, scene );

		return this;
	}

	has( nameOrPath: string ): boolean {
		return this._nameToScene.has( nameOrPath ) || this._pathToScene.has( nameOrPath );
	}

	async show( nameOrPath: string ): Promise<void> {
		await this._show( nameOrPath );
		this._updateUrl( this.current.path );
	}

	private async _show( nameOrPath: string ): Promise<void> {
		const scene = this._nameToScene.get( nameOrPath ) || this._pathToScene.get( nameOrPath );

		if ( !scene ) {
			throw new Error( 'Scene does not exist.' );
		}

		this.element.classList.add( 'changing' );

		if ( this.current ) {
			await wait( 80 );
			this.current.detach();
			this.element.innerHTML = '';
			this.element.classList.remove( 'scene-' + this.current.name );
		}

		this.current = scene;
		this.element.classList.add( 'scene-' + this.current.name );
		this.current.render( this );
		await wait( 80 );
		this.element.classList.remove( 'changing' );
	}

	private _updateUrl( path: string ): void {
		let pathName = window.location.pathname;

		if ( !pathName.endsWith( '/' ) ) {
			pathName += '/';
		}

		history.pushState( { path }, '', pathName + '#' + path );
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

	constructor( name: string, config: SceneConfig ) {
		this.name = name;
		this.path = config.path;
		this._creator = config.creator;
	}

	render( scenes: Scenes ): void {
		this._destructor = this._creator( scenes );
	}

	detach(): void {
		this._destructor();
	}
}

async function wait( ms = 0 ): Promise<void> {
	return new Promise( resolve => setTimeout( resolve, ms ) );
}
