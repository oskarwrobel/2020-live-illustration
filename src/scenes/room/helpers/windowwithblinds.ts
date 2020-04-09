import { gsap } from 'gsap';
import { SVG as svg, Text } from '@svgdotjs/svg.js';
import { random } from 'lodash-es';
import { openBlinds, closeBlinds } from './toggleblinds';
import Scenes from '../../../utils/scenes';
import sendEvent from '../../../utils/sendevent';
import createClipPath from '../../../utils/createclippath';

type AnimationConfig = {
	from: { x: number; y: number; scale: number };
	duration: number;
	delay?: number;
	direction?: 'left' | 'right';
	progress?: number;
	onProgress?: ( value: number ) => void;
}

type AnimationInLoopConfig = {
	duration: Range;
	scale: Range;
	delay?: Range;
	progress?: Range;
	level?: number;
}

type Range = [ number, number ];

const hashTags = [
	'#StayHome',
	'#QuarantineAndChill',
	'#WashYourHands',
	'#CallMom',
	'#StayHydrated'
];

let isLoopAnimationInProgress = false;

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
	windowRect = ( document.querySelector( '#window > path' ) as SVGGElement ).getBBox();

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

			// Whe there are already pending animations it means the blinds weren't fully closed before opening.
			// It may happen when someone toggles blinds in a short amount of time.
			if ( !isLoopAnimationInProgress ) {
				startAnimation( [ rightToLeftPlane, leftToRightPlane, cloud1, cloud2, cloud3 ] );
			}

			sendEvent( 'blinds', 'open', 'click' );
		} else {
			scenes.current.data.areBlindsOpen = false;
			closeBlinds( blinds ).then( stopAnimation );
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
	isLoopAnimationInProgress = true;

	const planes = [ rightToLeftPlane, leftToRightPlane ];

	currentPlane = planes[ random( 0, 1 ) ];
	animatePlaneInLoop( planes, { duration: [ 10, 15 ], delay: [ 5, 10 ], scale: [ 0.8, 1.2 ], progress: [ 0.1, 0.7 ] } );

	const scale = [ 0.8, 1.2 ] as [ number, number ];
	const cloud1Level = getAvailableCloudLevel( cloud1 );
	const cloud2Level = getAvailableCloudLevel( cloud2 );
	const cloud3Level = getAvailableCloudLevel( cloud3 );

	animateCloudInLoop( cloud1, { duration: [ 34, 40 ], progress: [ 0.5, 0.7 ], level: cloud1Level, scale } );
	animateCloudInLoop( cloud2, { duration: [ 20, 28 ], progress: [ 0.1, 0.3 ], level: cloud2Level, scale } );
	animateCloudInLoop( cloud3, { duration: [ 28, 34 ], progress: [ 0.3, 0.5 ], level: cloud3Level, scale } );
}

function stopAnimation(): void {
	isLoopAnimationInProgress = false;

	for ( const animation of elementToAnimation.values() ) {
		animation.kill();
	}

	elementToAnimation.clear();
	cloudToLevel.clear();
}

function animatePlaneInLoop( planes: SVGGElement[], config: AnimationInLoopConfig ): void {
	if ( !isLoopAnimationInProgress ) {
		return;
	}

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
		from: getInitialValues( currentPlane, initialX, getRandomY( currentPlane ), 1 ),
		duration: random( ...config.duration ),
		delay: config.delay ? random( ...config.delay ) : 0,
		progress: config.progress ? random( ...config.progress ) : 0,
		direction
	} ).then( () => {
		setBannerText( currentPlane, '' );
		animatePlaneInLoop( planes, {
			duration: config.duration,
			delay: config.delay,
			scale: config.scale
		} );
	} );
}

function animateCloudInLoop( element: SVGGElement, config: AnimationInLoopConfig ): void {
	if ( !isLoopAnimationInProgress ) {
		return;
	}

	const level = config.level === undefined ? getAvailableCloudLevel( element ) : config.level;
	let levelIsReleased = false;

	cloudToLevel.set( element, level );

	animateElement( element, {
		from: getInitialValues( element, 'right', getRandomY( element, level ), 1 ),
		duration: random( ...config.duration ),
		delay: config.delay ? random( ...config.delay ) : 0,
		progress: config.progress ? random( ...config.progress ) : 0,
		direction: 'left',
		onProgress( value: number ) {
			if ( !levelIsReleased && value > 0.5 && value < 1 ) {
				levelIsReleased = true;
				cloudToLevel.delete( element );
			}
		}
	} ).then( () => {
		animateCloudInLoop( element, {
			duration: config.duration,
			delay: config.delay,
			scale: config.scale
		} );
	} );
}

function animateElement( element: SVGGElement, config: AnimationConfig ): Promise<undefined> {
	const from = config.from;

	gsap.set( element, {
		xPercent: from.x,
		yPercent: from.y,
		scale: from.scale
	} );

	const svgWidth = parseInt( element.viewportElement.getAttribute( 'viewBox' ).split( ' ' )[ 2 ] );
	const elementRect = element.getBBox();
	let relativeToSvgX: number;

	if ( config.direction === 'left' ) {
		relativeToSvgX = -( ( ( windowRect.width + elementRect.width * from.scale ) * 100 ) / svgWidth );
	} else {
		relativeToSvgX = ( ( ( windowRect.x + windowRect.width ) - elementRect.width ) * 100 ) / svgWidth;
	}

	let onUpdate: () => void;

	if ( config.onProgress ) {
		onUpdate = function onProgress(): void {
			config.onProgress( this.progress() );
		};
	}

	return gsap.timeline( {
		onStart() {
			if ( config.progress ) {
				this.progress( config.progress );
			}

			elementToAnimation.set( element, this );
		},
		onUpdate,
		onComplete() {
			elementToAnimation.delete( element );
		}
	} ).to( element, {
		xPercent: '+=' + ( svgWidth / elementRect.width ) * relativeToSvgX,
		duration: config.duration,
		delay: config.delay,
		ease: 'none'
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

function getAvailableCloudLevel( element: SVGGElement ): number {
	const availableLevels = [];
	const usedLevels = Array.from( cloudToLevel.values() );

	for ( let i = 0; i < maxLevels; i++ ) {
		if ( !usedLevels.includes( i ) ) {
			availableLevels.push( i );
		}
	}

	const level = availableLevels[ random( 1, availableLevels.length ) - 1 ];

	cloudToLevel.set( element, level );

	return level;
}

function getRandomY( element: SVGGElement, level?: number ): number {
	if ( level !== undefined ) {
		const top = levelTopEdge + ( level * levelHeight );

		return random( top, top + 80 );
	}

	const elementRect = element.getBBox();
	const minY = windowRect.y + levelTopEdge;
	const maxY = windowRect.y + windowRect.height - elementRect.height;

	return random( minY, maxY );
}

function getRandomHashTag(): string {
	return hashTags[ random( 0, hashTags.length - 1 ) ];
}
