import { SVG as svg, Element, Text, Rect } from '@svgdotjs/svg.js';
import { gsap } from 'gsap';
import { random } from 'lodash-es';
import { toggleBlinds, openBlinds } from './toggleblinds';
import Illustrations from '../../utils/illustrations';
import sendEvent from '../../utils/sendevent';

type Range = [ number, number ];

const hashTags = [
	'#StayHome',
	'#QuarantineAndChill',
	'#WashYourHands',
	'#CallMom',
	'#StayHydrated'
];

// Window rect. Cashed for optimization purpose.
let windowRect: SVGRect;

// To avoid clouds overlapping the window area is split into levels.
// Each cloud has move only on the available level. When cloud is in the middle of the
// window width then the level is released and next cloud is allowed to move at the same level.
const levelTopEdge = 230;
const levelHeight = 170;
const maxLevels = 3;
const cloudToLevel: Map<Element, number> = new Map();

// Two separate planes (svg groups) are used to pretend one plane flying two ways.
// This variable represents the currently visible plane element.
let $currentPlane: Element;

// Stores all pending animations.
const elementToAnimation: Map<Element, gsap.core.Tween> = new Map();

export default function windowWithBlinds( illustrations: Illustrations ): () => void {
	windowRect = getWindowRect();

	const blinds: SVGGElement[] = Array.from( document.querySelectorAll( '#blinds > g' ) );
	const $rightToLeftPlane = svg( '#plane-1' ) as Element;
	const $leftToRightPlane = svg( '#plane-2' ) as Element;
	const $cloud1 = svg( '#cloud-1' );
	const $cloud2 = svg( '#cloud-2' ) as Element;
	const $cloud3 = svg( '#cloud-3' ) as Element;

	document.querySelector( '#blinds' ).addEventListener( 'click', () => {
		if ( !illustrations.current.data.wasOpened ) {
			sendEvent( 'blinds', 'click', 'first' );
			startAnimation( [ $rightToLeftPlane, $leftToRightPlane, $cloud1, $cloud2, $cloud3 ] );
		} else {
			sendEvent( 'blinds', 'click', 'again', {
				toOpen: !illustrations.current.data.areBlindsOpened
			} );
		}

		toggleBlinds( blinds, illustrations.current.data );
		illustrations.current.data.wasOpened = true;
	} );

	if ( illustrations.current.data.wasOpened ) {
		sendEvent( 'blinds', 'continueAnimation' );
		continueAnimation( [ $rightToLeftPlane, $leftToRightPlane, $cloud1, $cloud2, $cloud3 ] );
	}

	if ( illustrations.current.data.areBlindsOpened ) {
		sendEvent( 'blinds', 'openOnInit' );
		openBlinds( blinds );
	}

	return function windowWithBlindsDestructor(): void {
		Array.from( elementToAnimation.values() ).forEach( animation => animation.kill() );
		elementToAnimation.clear();
		cloudToLevel.clear();
		$currentPlane = null;
	};
}

function startAnimation( [ $rightToLeftPlane, $leftToRightPlane, $cloud1, $cloud2, $cloud3 ]: Element[] ): void {
	setPlaneText( $rightToLeftPlane, hashTags[ 0 ] );
	setPlaneText( $leftToRightPlane, hashTags[ 1 ], true );
	$rightToLeftPlane.move( windowRect.x + windowRect.width, 480 );
	$leftToRightPlane.size( null, 75 ).move( windowRect.x - $leftToRightPlane.width(), 280 );
	$currentPlane = $rightToLeftPlane;

	animateElement( $currentPlane, 12, 6, 'left' ).then( () => {
		animatePlaneInLoop( [ $rightToLeftPlane, $leftToRightPlane ], [ 10, 15 ], [ 5, 10 ], [ 50, 90 ] );
	} );

	$cloud1.move( 1700, 280 );
	animateElement( $cloud1, 30, 0, 'left' ).then( () => {
		animateCloudInLoop( $cloud1, [ 34, 40 ], [ 0, 0 ], [ 200, 310 ] );
	} );

	$cloud2.move( 1300, 600 );
	animateElement( $cloud2, 30, 0, 'left' ).then( () => {
		animateCloudInLoop( $cloud2, [ 20, 28 ], [ 0, 0 ], [ 220, 325 ] );
	} );

	$cloud3.move( 1800, 400 );
	cloudToLevel.set( $cloud3, 1 );
	animateElement( $cloud3, 50, 10, 'left' ).then( () => {
		cloudToLevel.delete( $cloud3 );
		animateCloudInLoop( $cloud3, [ 28, 34 ], [ 0, 0 ], [ 400, 530 ] );
	} );
}

function continueAnimation( [ $rightToLeftPlane, $leftToRightPlane, $cloud1, $cloud2, $cloud3 ]: Element[] ): void {
	animatePlaneInLoop( [ $rightToLeftPlane, $leftToRightPlane ], [ 10, 15 ], [ 5, 10 ], [ 50, 90 ] );
	animateCloudInLoop( $cloud1, [ 34, 40 ], [ 0, 0 ], [ 200, 310 ] );
	animateCloudInLoop( $cloud2, [ 20, 28 ], [ 0, 0 ], [ 220, 325 ] );
	animateCloudInLoop( $cloud3, [ 28, 34 ], [ 0, 0 ], [ 400, 530 ] );
}

function animatePlaneInLoop( planes: Element[], duration: Range, delay: Range, size: Range ): void {
	const [ $rightToLeftPlane, $leftToRightPlane ] = planes;

	let direction: string;

	if ( $currentPlane === $leftToRightPlane ) {
		$currentPlane = $rightToLeftPlane;
		direction = 'left';
		setPlaneText( $currentPlane, getRandomHashTag() );

		$currentPlane
			.transform( { translateX: 0 } )
			.size( null, random( ...size ) )
			.move( windowRect.x + windowRect.width, getRandomY( $currentPlane ) );
	} else {
		$currentPlane = $leftToRightPlane;
		direction = 'right';
		setPlaneText( $currentPlane, getRandomHashTag(), true );

		$currentPlane
			.transform( { translateX: 0 } )
			.size( null, random( ...size ) )
			.move( windowRect.x - $currentPlane.width(), getRandomY( $currentPlane ) );
	}

	animateElement( $currentPlane, random( ...duration ), random( ...delay ), direction ).then( () => {
		animatePlaneInLoop( planes, duration, delay, size );
	} );
}

function animateCloudInLoop( $element: Element, duration: Range, delay: Range, size: Range ): void {
	const availableSections = [];

	for ( let i = 0; i < maxLevels; i++ ) {
		if ( !Array.from( cloudToLevel.values() ).includes( i ) ) {
			availableSections.push( i );
		}
	}

	const section = availableSections[ random( 0, availableSections.length - 1 ) ];

	cloudToLevel.set( $element, section );

	$element
		.size( random( ...size ) )
		.move( windowRect.x + windowRect.width, getRandomY( $element, section ) );

	animateElement( $element, random( ...duration ), random( ...delay ), 'left' ).then( () => {
		animateCloudInLoop( $element, duration, delay, size );
	} );
}

function animateElement( $element: Element, duration: number, delay = 0, direction = 'left' ): Promise<undefined> {
	const elementRect = $element.bbox();
	const x = direction === 'left' ?
		-( elementRect.x + elementRect.width - windowRect.x ) : ( windowRect.x + windowRect.width ) - elementRect.x;

	return new Promise( resolve => {
		const animation = gsap.to( $element.node, { duration, delay, x,
			ease: 'none',
			clearProps: 'all',
			onComplete: resolve,
			onUpdate() {
				if ( animation.progress() >= 0.5 ) {
					cloudToLevel.delete( $element );
				}
			}
		} );

		elementToAnimation.set( $element, animation );
	} );
}

function setPlaneText( $plane: Element, text: string, stickToRight = false ): void {
	const elements = $plane.node.firstChild.firstChild.childNodes as NodeList;
	const $tail = svg( elements[ 0 ] );
	const $textBg = svg( elements[ 1 ] );
	const $text = svg( elements[ 2 ] ) as Text;

	$text.plain( text );

	// Do not use $text.width() because returns incorrect result in this case.
	const width = $text.bbox().width + 20;

	$textBg.width( width );

	if ( stickToRight ) {
		const bound = ( $plane.findOne( 'rect' ) as Rect ).x();

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

function getRandomY( $element: Element, level?: number ): number {
	if ( level !== undefined ) {
		const top = levelTopEdge + ( level * levelHeight );

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
	return ( document.querySelector( '#window > path' ) as SVGGElement ).getBBox();
}
