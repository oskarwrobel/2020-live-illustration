import { throttle } from 'lodash-es';
import setProportions from './setproportions';

type IllustrationCreator = ( illustrations: Illustrations ) => Illustration;
export type Illustration = {
	destroy(): void;
}

export default class Illustrations {
	private readonly _illustrations: Map<string, IllustrationCreator> = new Map();
	private _current: Illustration;
	readonly element: HTMLElement;

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

	add( name: string, creator: IllustrationCreator ): void {
		if ( this._illustrations.has( name ) ) {
			throw new Error( 'Illustration already created.' );
		}

		this._illustrations.set( name, creator );
	}

	show( name: string ): void {
		if ( !this._illustrations.has( name ) ) {
			throw new Error( 'Illustration does not exist.' );
		}

		if ( this._current ) {
			this._current.destroy();
		}

		this._current = this._illustrations.get( name )( this );
	}
}
