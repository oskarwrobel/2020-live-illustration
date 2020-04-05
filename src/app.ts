import Scenes from './utils/scenes';

import roomCreator from './scenes/room/creator';
import oscarCreator from './scenes/oscar/creator';
import drawerCreator from './scenes/drawer/creator';

import './app.css';

const wrapperElement = document.querySelector( '#scene' ) as HTMLDivElement;
const scenes = new Scenes( wrapperElement, '1280x720' );

scenes.add( 'room', roomCreator );
scenes.add( 'oscar', oscarCreator );
scenes.add( 'drawer', drawerCreator );

scenes.show( 'room' );
