import { SVG as svg } from '@svgdotjs/svg.js';
import gsap from 'gsap';
import { random } from 'lodash-es';
import { toggleBlinds, openBlinds } from './toggleblinds';
import Illustrations from '../../utils/illustrations';

type NumberRange = [ number, number ];

const sectionTop = 230;
const sectionHeight = 170;
const maxSections = 3;

const hashTags = [
	'#StayHome',
	'#QuarantineAndChill',
	'#WashYourHands',
	'#CallMom',
	'#StayHydrated'
];

const usedSections: Map<svg.Element, number> = new Map();
let windowRect: SVGRect;
let $currentPlane: svg.Element;
const elementToAnimation: Map<svg.Element, gsap.Tween> = new Map();

export default function windowWithBlinds( illustrations: Illustrations ): () => void {
	windowRect = getWindowRect();

	const blinds: SVGGElement[] = Array.from( document.querySelectorAll( '#blinds > g' ) );
	const $plane1 = svg( '#plane-1' ) as svg.Element;
	const $plane2 = svg( '#plane-2' ) as svg.Element;
	const $cloud1 = svg( '#cloud-1' ) as svg.Element;
	const $cloud2 = svg( '#cloud-2' ) as svg.Element;
	const $cloud3 = svg( '#cloud-3' ) as svg.Element;

	setPlaneBannerText( $plane1, hashTags[ 0 ] );
	setPlaneBannerText( $plane2, hashTags[ 1 ], true );

	$plane1.move( windowRect.x + windowRect.width, 480 );
	$plane2.size( null, 75 ).move( windowRect.x - $plane2.width(), 280 );
	$cloud1.move( 1700, 280 );
	$cloud2.move( 1300, 600 );
	$cloud3.move( 1800, 400 );

	document.querySelector( '#blinds' ).addEventListener( 'click', () => {
		if ( !illustrations.current.data.wasOpened ) {
			fromRightToLeft( $plane1, 12, 6 ).then( () => {
				$currentPlane = $plane1;
				animatePlanesInLoop( [ $plane1, $plane2 ], [ 10, 15 ], [ 5, 10 ], [ 50, 90 ] );
			} );

			fromRightToLeft( $cloud1, 30 ).then( () => {
				animateCloudInLoop( $cloud1, [ 34, 40 ], [ 0, 0 ], [ 200, 310 ] );
			} );

			fromRightToLeft( $cloud2, 30 ).then( () => {
				animateCloudInLoop( $cloud2, [ 20, 28 ], [ 0, 0 ], [ 220, 325 ] );
			} );

			usedSections.set( $cloud3, 1 );
			fromRightToLeft( $cloud3, 50, 10 ).then( () => {
				usedSections.delete( $cloud3 );
				animateCloudInLoop( $cloud3, [ 28, 34 ], [ 0, 0 ], [ 400, 530 ] );
			} );
		}

		toggleBlinds( blinds, illustrations.current.data );
		illustrations.current.data.wasOpened = true;
	} );

	if ( illustrations.current.data.areBlindsOpened ) {
		openBlinds( blinds );
	}

	return function windowWithBlindsDestructor(): void {
		Array.from( elementToAnimation.values() ).forEach( animation => animation.kill() );
		elementToAnimation.clear();
	};
}

function animatePlanesInLoop( planes: svg.Element[], duration: NumberRange, delay: NumberRange, size: NumberRange ): void {
	const [ $plane1, $plane2 ] = planes;

	let animation: any;
	let x;

	if ( $currentPlane === $plane2 ) {
		$currentPlane = $plane1;
		setPlaneBannerText( $currentPlane, getRandomHashTag() );
		animation = fromRightToLeft;
		x = windowRect.x + windowRect.width;
	} else {
		$currentPlane = $plane2;
		setPlaneBannerText( $currentPlane, getRandomHashTag(), true );
		animation = fromLeftToRight;
		x = windowRect.x - $currentPlane.width();
	}

	$currentPlane
		.transform( { translateX: 0 } )
		.size( null, random( ...size ) )
		.move( x, getRandomY( $currentPlane ) );

	animation( $currentPlane, random( ...duration ), random( ...delay ) )
		.then( () => animatePlanesInLoop( planes, duration, delay, size ) );
}

function animateCloudInLoop( $element: svg.Element, duration: NumberRange, delay: NumberRange, size: NumberRange ): void {
	const availableSections = [];

	for ( let i = 0; i < maxSections; i++ ) {
		if ( !Array.from( usedSections.values() ).includes( i ) ) {
			availableSections.push( i );
		}
	}

	const section = availableSections[ random( 0, availableSections.length - 1 ) ];

	usedSections.set( $element, section );

	$element
		.size( random( ...size ) )
		.move( windowRect.x + windowRect.width, getRandomY( $element, section ) );

	fromRightToLeft( $element, random( ...duration ), random( ...delay ) ).then( () => {
		animateCloudInLoop( $element, duration, delay, size );
	} );
}

function fromRightToLeft( $element: svg.Element, duration: number, delay = 0 ): Promise<undefined> {
	const elementRect = $element.bbox();

	return new Promise( resolve => {
		const animation = gsap.to( $element.node, {
			duration,
			delay,
			ease: 'none',
			x: -( elementRect.x + elementRect.width - windowRect.x ),
			onUpdate() {
				if ( animation.progress() >= 0.5 ) {
					usedSections.delete( $element );
				}
			},
			onComplete: resolve,
			clearProps: 'all'
		} );

		elementToAnimation.set( $element, animation );
	} );
}

function fromLeftToRight( $element: svg.Element, duration: number, delay = 0 ): Promise<undefined> {
	const elementRect = $element.bbox();

	return new Promise( resolve => {
		const animation = gsap.to( $element.node, {
			duration,
			delay,
			ease: 'none',
			x: ( windowRect.x + windowRect.width ) - elementRect.x,
			onComplete: resolve,
			clearProps: 'all'
		} );

		elementToAnimation.set( $element, animation );
	} );
}

function setPlaneBannerText( $plane: svg.Element, text: string, stickToRight = false ): void {
	const elements = $plane.node.firstChild.firstChild.childNodes as NodeList;
	const $tail = svg( elements[ 0 ] );
	const $textBg = svg( elements[ 1 ] );
	const $text = svg( elements[ 2 ] );

	$text.plain( text );

	// Do not use $text.width() because returns incorrect result in this case.
	const width = $text.bbox().width + 20;

	$textBg.width( width );

	if ( stickToRight ) {
		const bound = $plane.findOne( 'rect' ).x();

		$textBg.x( bound - width );
		$tail.x( bound - width - 30 );

		const bgRect = $textBg.bbox();

		$text.node.removeAttribute( 'transform' );
		$text.x( bgRect.x + 5 );
		$text.y( bgRect.y );
	} else {
		const bgRect = $textBg.bbox();

		$tail.x( bgRect.x + bgRect.width );
	}
}

function getRandomY( $element: svg.Element, section?: number ): number {
	if ( section !== undefined ) {
		const top = sectionTop + ( section * sectionHeight );

		return random( top, top + 80 );
	}

	const elementRect = $element.bbox();
	const minY = windowRect.y + 150;
	const maxY = windowRect.y + windowRect.height - elementRect.height;

	return random( minY, maxY );
}

function getRandomHashTag(): string {
	return hashTags[ random( 0, hashTags.length - 1 ) ];
}

function getWindowRect(): SVGRect {
	const windowElement = document.querySelector( '#window > path' ) as SVGGElement;

	return windowElement.getBBox();
}
