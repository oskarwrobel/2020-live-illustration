import { throttle } from 'lodash-es';
import setProportions from './setproportions';

export type SceneCreator = ( scenes: Scenes ) => SceneDestructor;
export type SceneDestructor = () => void;

/**
 * Creates, destroys and switches between scenes.
 */
export default class Scenes {
	private readonly _scenes: Map<string, Scene> = new Map();
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
	}

	add( name: string, creator: SceneCreator ): void {
		if ( this._scenes.has( name ) ) {
			throw new Error( 'Scene already created.' );
		}

		this._scenes.set( name, new Scene( name, creator ) );
	}

	async show( name: string ): Promise<void> {
		if ( !this._scenes.has( name ) ) {
			throw new Error( 'Scene does not exist.' );
		}

		this.element.classList.add( 'changing' );

		if ( this.current ) {
			await wait( 80 );
			this.current.detach();
			this.element.innerHTML = '';
			this.element.classList.remove( this.current.name );
		}

		this.current = this._scenes.get( name );
		this.element.classList.add( 'scene-' + this.current.name );
		this.current.render( this );
		await wait( 80 );
		this.element.classList.remove( 'changing' );
	}
}

/**
 * Single scene representation.
 */
export class Scene {
	private readonly _creator: SceneCreator;
	private _destructor: SceneDestructor;
	readonly name: string;
	data: any = {};

	constructor( name: string, creator: SceneCreator ) {
		this.name = name;
		this._creator = creator;
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
