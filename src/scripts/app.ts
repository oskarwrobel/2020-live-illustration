import { throttle } from 'lodash-es';
import setProportions from './utils/setproportions';
import createSvgElement from './utils/createsvgelement';
import parallax from './utils/parallax';
import blinds from './blinds';
import toodEyes from './toodeyes';

import '../styles/app.css';

import hallSvgString from '../images/hall.svg';
import dogSvgString from '../images/dog.svg';
import wallSvgString from '../images/wall.svg';
import lampSvgString from '../images/lamp.svg';
import tvSvgString from '../images/tv.svg';

const optimalWidth = 1280;
const optimalHeight = 720;

const illustration = document.querySelector( '.illustration' ) as HTMLDivElement;
const hall = createSvgElement( hallSvgString, { id: 'hall', classes: 'scene' }, illustration );
const dog = createSvgElement( dogSvgString, { id: 'dog', classes: 'scene' }, illustration );
const wall = createSvgElement( wallSvgString, { id: 'wall', classes: 'scene' }, illustration );
const lamp = createSvgElement( lampSvgString, { id: 'lamp', classes: 'scene' }, illustration );
const tv = createSvgElement( tvSvgString, { id: 'tv', classes: 'scene' }, illustration );

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
