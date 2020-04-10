import Scenes from './utils/scenes';

import roomSceneCreator from './scenes/room/creator';
import oscarSceneCreator from './scenes/oscar/creator';
import drawerSceneCreator from './scenes/drawer/creator';
import postcardSceneCreator from './scenes/postcard/creator';

import './app.css';

const wrapperElement = document.querySelector( '#scene' ) as HTMLDivElement;
const scenes = new Scenes( wrapperElement, '1280x720' );

scenes
	.add( 'room', { creator: roomSceneCreator, path: '/' } )
	.add( 'oscar', { creator: oscarSceneCreator, path: '/oscar' } )
	.add( 'drawer', { creator: drawerSceneCreator, path: '/drawer' } )
	.add( 'postcard', { creator: postcardSceneCreator, path: '/postcard' } );

if ( window.location.hash ) {
	const path = window.location.hash.replace( '#', '' );

	if ( scenes.has( path ) ) {
		scenes.show( path );
	} else {
		scenes.show( '/' );
	}
}
