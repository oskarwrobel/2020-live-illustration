import Scenes from './utils/scenes';

import roomSceneCreator from './scenes/room/creator';
import oscarSceneCreator from './scenes/oscar/creator';
import drawerSceneCreator from './scenes/drawer/creator';
import postcardSceneCreator from './scenes/postcard/creator';

import './app.css';

const wrapperElement = document.querySelector( '#scene' ) as HTMLDivElement;
const scenes = new Scenes( wrapperElement, '1280x720' );

scenes
	.add( 'room', roomSceneCreator )
	.add( 'oscar', oscarSceneCreator )
	.add( 'drawer', drawerSceneCreator )
	.add( 'postcard', postcardSceneCreator )
	.show( 'room' );
