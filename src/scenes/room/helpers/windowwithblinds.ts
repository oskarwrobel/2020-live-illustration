import { gsap } from 'gsap';
import { SVG as svg, Text } from '@svgdotjs/svg.js';
import { random } from 'lodash-es';
import { openBlinds, closeBlinds } from './toggleblinds';
import Scenes from '../../../utils/scenes';
import sendEvent from '../../../utils/sendevent';
import createClipPath from '../../../utils/createclippath';

type AnimationConfig = {
	delay: number;
	duration: number;
	direction?: 'left' | 'right';
	randomProgress?: boolean;
	from: { x: number; y: number; scale: number };
}

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
const cloudToLevel: Map<SVGGElement, number> = new Map();

// Two separate planes (svg groups) are used to pretend one plane flying two ways.
// This variable represents the currently visible plane element.
let currentPlane: SVGGElement;

// Stores all pending animations.
const elementToAnimation: Map<SVGGElement, gsap.core.Tween> = new Map();

export default function windowWithBlinds( scenes: Scenes ): () => void {
	windowRect = getWindowRect();

	createClipPath( {
		source: '#wall > rect',
		targets: [ '#wall > g' ]
	} );

	const blinds: SVGGElement[] = Array.from( document.querySelectorAll( '#blinds > g' ) );
	const rightToLeftPlane = document.querySelector( '#plane-1' ) as SVGGElement;
	const leftToRightPlane = document.querySelector( '#plane-2' ) as SVGGElement;
	const cloud1 = document.querySelector( '#cloud-1' ) as SVGGElement;
	const cloud2 = document.querySelector( '#cloud-2' ) as SVGGElement;
	const cloud3 = document.querySelector( '#cloud-3' ) as SVGGElement;

	document.querySelector( '#blinds' ).addEventListener( 'click', () => {
		if ( !scenes.current.data.areBlindsOpen ) {
			scenes.current.data.areBlindsOpen = true;
			openBlinds( blinds );
			startAnimation( [ rightToLeftPlane, leftToRightPlane, cloud1, cloud2, cloud3 ] );
			sendEvent( 'blinds', 'open', 'click' );
		} else {
			scenes.current.data.areBlindsOpen = false;
			closeBlinds( blinds );
			setTimeout( stopAnimation, 1000 );
			sendEvent( 'blinds', 'close', 'click' );
		}
	} );

	if ( scenes.current.data.areBlindsOpened ) {
		openBlinds( blinds );
		sendEvent( 'blinds', 'open', 'init' );
	}

	return function windowWithBlindsDestructor(): void {
		stopAnimation();
		elementToAnimation.clear();
		cloudToLevel.clear();
		currentPlane = null;
	};
}

function startAnimation( [ rightToLeftPlane, leftToRightPlane, cloud1, cloud2, cloud3 ]: SVGGElement[] ): void {
	const planes = [ rightToLeftPlane, leftToRightPlane ];

	currentPlane = planes[ random( 0, 1 ) ];

	animatePlaneInLoop( planes, [ 10, 15 ], [ 5, 10 ], [ 0.8, 1.2 ], true );
	animateCloudInLoop( cloud1, [ 34, 40 ], [ 0, 0 ], [ 0.8, 1.2 ], true );
	animateCloudInLoop( cloud2, [ 20, 28 ], [ 0, 0 ], [ 0.8, 1.2 ], true );
	animateCloudInLoop( cloud3, [ 28, 34 ], [ 0, 0 ], [ 0.8, 1.2 ], true );
}

function stopAnimation(): void {
	for ( const animation of elementToAnimation.values() ) {
		animation.kill();
	}

	elementToAnimation.clear();
}

function animatePlaneInLoop( planes: SVGGElement[], duration: Range, delay: Range, scale: Range, randomProgress = false ): void {
	const [ rightToLeftPlane, leftToRightPlane ] = planes;

	let direction: 'left' | 'right';
	let initialX: 'left' | 'right';

	if ( currentPlane === leftToRightPlane ) {
		currentPlane = rightToLeftPlane;
		direction = 'left';
		initialX = 'right';
		setBannerText( currentPlane, getRandomHashTag() );
	} else {
		currentPlane = leftToRightPlane;
		direction = 'right';
		initialX = 'left';
		setBannerText( currentPlane, getRandomHashTag(), true );
	}

	animateElement( currentPlane, {
		from: getInitialValues( currentPlane, initialX, getRandomY( currentPlane ), random( ...scale ) ),
		duration: random( ...duration ),
		delay: random( ...delay ),
		direction,
		randomProgress
	} ).then( () => {
		setBannerText( currentPlane, '' );
		animatePlaneInLoop( planes, duration, delay, scale );
	} );
}

function animateCloudInLoop( element: SVGGElement, duration: Range, delay: Range, scale: Range, randomProgress = false ): void {
	const level = getAvailableCloudLevel();

	cloudToLevel.set( element, level );

	animateElement( element, {
		from: getInitialValues( element, 'right', getRandomY( element, level ), random( ...scale ) ),
		duration: random( ...duration ),
		delay: random( ...delay ),
		direction: 'left',
		randomProgress
	} ).then( () => {
		animateCloudInLoop( element, duration, delay, scale );
	} );
}

function animateElement( element: SVGGElement, config: AnimationConfig ): Promise<undefined> {
	const svgWidth = parseInt( element.viewportElement.getAttribute( 'viewBox' ).split( ' ' )[ 2 ] );
	const elementRect = element.getBBox();
	const from = config.from;
	let relativeToSvgX: number;

	if ( config.direction === 'left' ) {
		relativeToSvgX = -( ( ( windowRect.width + elementRect.width * from.scale ) * 100 ) / svgWidth );
	} else {
		relativeToSvgX = ( ( ( windowRect.x + windowRect.width ) - elementRect.width ) * 100 ) / svgWidth;
	}

	return new Promise( resolve => {
		const animation = gsap.fromTo( element,
			{
				xPercent: from.x
			},
			{
				xPercent: '+=' + ( svgWidth / elementRect.width ) * relativeToSvgX,
				startAt: {
					yPercent: from.y,
					scale: from.scale
				},
				duration: config.delay,
				delay: config.duration,
				ease: 'none',
				clearProps: 'all',
				onUpdate() {
					// if ( animation ) {
					// 	console.log( 'abc' );
					// }
					// if ( !config.randomProgress && animation.progress() >= 0.5 ) {
					// 	cloudToLevel.delete( element );
					// }
				},
				onComplete() {
					elementToAnimation.delete( element );
					resolve();
				}
			}
		);

		if ( config.randomProgress ) {
			animation.progress( random( 0.1, 0.9 ) );
		}

		elementToAnimation.set( element, animation );
	} );
}

function setBannerText( plane: SVGGElement, text: string, stickToRight = false ): void {
	const elements = plane.firstChild.firstChild.childNodes as NodeList;
	const $tail = svg( elements[ 0 ] );
	const $textBg = svg( elements[ 1 ] );
	const $text = svg( elements[ 2 ] ) as Text;

	$text.plain( text );

	// Do not use $text.width() because returns incorrect result in this case.
	const width = $text.bbox().width + 20;

	$textBg.width( width );

	if ( stickToRight ) {
		const bound = ( plane.querySelector( 'rect' ) as SVGRectElement ).getBBox().x;

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

function getInitialValues( element: SVGGElement, x: 'left' | 'right', y: number, scale: number ): { x: number; y: number; scale: number } {
	const svgWidth = parseInt( element.viewportElement.getAttribute( 'viewBox' ).split( ' ' )[ 2 ] );
	const svgHeight = parseInt( element.viewportElement.getAttribute( 'viewBox' ).split( ' ' )[ 3 ] );
	const elementRect = element.getBBox();

	let relativeToSvgX: number;

	if ( x === 'right' ) {
		relativeToSvgX = ( ( ( windowRect.x + windowRect.width ) - ( elementRect.x * scale ) ) * 100 ) / svgWidth;
	} else {
		relativeToSvgX = ( ( ( windowRect.x - ( elementRect.width * scale ) ) - ( elementRect.x * scale ) ) * 100 ) / svgWidth;
	}

	const relativeToSvgY = ( ( y - ( elementRect.y * scale ) ) * 100 ) / svgHeight;

	return {
		x: ( svgWidth / elementRect.width ) * relativeToSvgX,
		y: ( svgHeight / elementRect.height ) * relativeToSvgY,
		scale
	};
}

function getAvailableCloudLevel(): number {
	const availableLevels = [];

	for ( let i = 0; i < maxLevels; i++ ) {
		if ( !Array.from( cloudToLevel.values() ).includes( i ) ) {
			availableLevels.push( i );
		}
	}

	return availableLevels[ random( 0, availableLevels.length - 1 ) ];
}

function getRandomY( element: SVGGElement, level?: number ): number {
	if ( level !== undefined ) {
		const top = levelTopEdge + ( level * levelHeight );

		return random( top, top + 80 );
	}

	const elementRect = element.getBBox();
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
