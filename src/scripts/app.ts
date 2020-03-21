import { throttle } from 'lodash-es';
import setProportions from './utils/setproportions';
import parallax from './utils/parallax';
import blinds from './blinds';
import toodEyes from './toodeyes';
import '../styles/app.css';

const optimalWidth = 1280;
const optimalHeight = 720;

const illustration = document.querySelector( '.illustration' ) as HTMLDivElement;
const hall = document.querySelector( '#hall' ) as SVGAElement;
const dog = document.querySelector( '#dog' ) as SVGAElement;
const wall = document.querySelector( '#wall' ) as SVGAElement;
const lamp = document.querySelector( '#lamp' ) as SVGAElement;
const tv = document.querySelector( '#tv' ) as SVGAElement;

// Keeps proper proportions.
window.addEventListener( 'resize', throttle( () => {
	setProportions( illustration, optimalWidth, optimalHeight );
}, 100, { leading: true } ) );

window.addEventListener( 'orientationchange', () => {
	setProportions( illustration, optimalWidth, optimalHeight );
} );

setProportions( illustration, optimalWidth, optimalHeight );

// Initialize parallax.
parallax( {
	scene: illustration,
	items: [
		{ element: hall, friction: 0.05 },
		{ element: dog, friction: 0.065 },
		{ element: wall, friction: 0.03 },
		{ element: lamp, friction: 0.2 },
		{ element: tv, friction: 0.05 }
	]
} );

blinds();
toodEyes();
