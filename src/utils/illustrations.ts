import { throttle } from 'lodash-es';
import setProportions from './setproportions';

export type IllustrationCreator = ( illustrations: Illustrations ) => IllustrationDestructor;
export type IllustrationDestructor = () => void;

export default class Illustrations {
	private readonly _illustrations: Map<string, Illustration> = new Map();
	readonly element: HTMLElement;
	current: Illustration;

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

		this._illustrations.set( name, new Illustration( creator ) );
	}

	async show( name: string ): Promise<void> {
		if ( !this._illustrations.has( name ) ) {
			throw new Error( 'Illustration does not exist.' );
		}

		this.element.classList.add( 'changing' );

		if ( this.current ) {
			await wait( 80 );
			this.current.detach();
		}

		this.current = this._illustrations.get( name );
		this.current.render( this );
		await wait( 80 );
		this.element.classList.remove( 'changing' );
	}
}

export class Illustration {
	private readonly _creator: IllustrationCreator;
	private _destructor: IllustrationDestructor;
	data: any = {};

	constructor( creator: IllustrationCreator ) {
		this._creator = creator;
	}

	render( illustrations: Illustrations ): void {
		this._destructor = this._creator( illustrations );
	}

	detach(): void {
		this._destructor();
	}
}

async function wait( ms = 0 ): Promise<void> {
	return new Promise( resolve => setTimeout( resolve, ms ) );
}
