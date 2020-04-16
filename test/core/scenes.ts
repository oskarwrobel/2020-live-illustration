import { expect } from 'chai';
import * as sinon from 'sinon';
import Scenes from '../../src/core/scenes';

describe( 'Scenes', () => {
	let element: HTMLElement;
	let sandbox: sinon.SinonSandbox;

	beforeEach( () => {
		element = document.createElement( 'div' );
		sandbox = sinon.createSandbox();
	} );

	afterEach( () => {
		sandbox.restore();
	} );

	describe( 'constructor()', () => {
		it( 'should create instance', () => {
			const scenes = new Scenes( element, '1:1' );

			expect( scenes.element ).to.equal( element );
			expect( scenes.proportions ).to.equal( '1:1' );
			expect( scenes.current ).to.undefined;

			scenes.destroy();
		} );

		it( 'should set size to element and update it with throttle after resize', () => {
			const time = sandbox.useFakeTimers();

			let innerWidth = 1000;
			let innerHeight = 1500;

			sandbox.stub( window, 'innerWidth' ).get( () => innerWidth );
			sandbox.stub( window, 'innerHeight' ).get( () => innerHeight );

			const scenes = new Scenes( element, '1:1' );

			expect( scenes.element.style.width ).to.equal( '1000px' );
			expect( scenes.element.style.height ).to.equal( '1000px' );

			innerWidth = 1100;
			innerHeight = 1500;
			window.dispatchEvent( new Event( 'resize' ) );

			expect( scenes.element.style.width ).to.equal( '1100px' );
			expect( scenes.element.style.height ).to.equal( '1100px' );

			innerWidth = 1200;
			innerHeight = 1500;
			window.dispatchEvent( new Event( 'resize' ) );
			time.tick( 50 );

			expect( scenes.element.style.width ).to.equal( '1100px' );
			expect( scenes.element.style.height ).to.equal( '1100px' );

			time.tick( 50 );
			expect( scenes.element.style.width ).to.equal( '1200px' );
			expect( scenes.element.style.height ).to.equal( '1200px' );

			scenes.destroy();
		} );

		it( 'should set size to element and update it after orientation change', () => {
			let innerWidth = 1000;
			let innerHeight = 1500;

			sandbox.stub( window, 'innerWidth' ).get( () => innerWidth );
			sandbox.stub( window, 'innerHeight' ).get( () => innerHeight );

			const scenes = new Scenes( element, '1:1' );

			expect( scenes.element.style.width ).to.equal( '1000px' );
			expect( scenes.element.style.height ).to.equal( '1000px' );

			innerWidth = 1100;
			innerHeight = 1500;
			window.dispatchEvent( new Event( 'orientationchange' ) );

			expect( scenes.element.style.width ).to.equal( '1100px' );
			expect( scenes.element.style.height ).to.equal( '1100px' );

			scenes.destroy();
		} );

		it( 'should show scene on popstate change', () => {
			const time = sandbox.useFakeTimers();
			const scenes = new Scenes( element, '1:1' );

			scenes.add( 'scene-1', {
				path: '/scene-1',
				creator: sinon.stub().returns( sinon.spy() )
			} );

			expect( scenes.current ).to.undefined;

			window.dispatchEvent( new PopStateEvent( 'popstate', {
				state: {
					path: '/scene-1'
				}
			} ) );

			time.tick( 160 );

			expect( scenes.current.name ).to.equal( 'scene-1' );

			scenes.destroy();
		} );
	} );

	describe( 'add() / has()', () => {
		it( 'should add new scene under the name and path name', () => {
			const scenes = new Scenes( element, '1:1' );

			scenes.add( 'scene-1', {
				path: '/scene-1-path',
				creator: sinon.stub()
			} );

			expect( scenes.has( 'scene-1' ) ).to.true;
			expect( scenes.has( '/scene-1-path' ) ).to.true;
			expect( scenes.has( 'undefined-scene' ) ).to.false;
			expect( scenes.has( '/undefined-scene-path' ) ).to.false;

			scenes.destroy();
		} );

		it( 'should throw when scene with the same name has been already added', () => {
			const scenes = new Scenes( element, '1:1' );

			scenes.add( 'scene-1', {
				path: '/scene-1-path',
				creator: sinon.stub()
			} );

			expect( () => {
				scenes.add( 'scene-1', {
					path: '/scene-2-path',
					creator: sinon.stub()
				} );
			} ).to.throw( Error, 'Scene with the same name already created.' );

			scenes.destroy();
		} );

		it( 'should throw when scene with the same path has been already added', () => {
			const scenes = new Scenes( element, '1:1' );

			scenes.add( 'scene-1', {
				path: '/scene-1-path',
				creator: sinon.stub()
			} );

			expect( () => {
				scenes.add( 'scene-2', {
					path: '/scene-1-path',
					creator: sinon.stub()
				} );
			} ).to.throw( Error, 'Scene with the same path already created.' );

			scenes.destroy();
		} );
	} );

	describe( 'show()', () => {
		it( 'should be rejected when scene is not defined', async () => {
			const scenes = new Scenes( element, '1:1' );

			let error: Error;

			try {
				await scenes.show( 'something' );
			} catch ( err ) {
				error = err;
			}

			expect( error ).to.instanceof( Error );

			scenes.destroy();
		} );

		it( 'should show initial scene using scene name', async () => {
			const scenes = new Scenes( element, '1:1' );
			const destructorSpy = sinon.spy();
			const creatorSpy = sinon.stub().returns( destructorSpy );

			scenes.add( 'scene-1', {
				path: '/scene-1-path',
				creator: creatorSpy
			} );

			await scenes.show( 'scene-1' );

			expect( scenes.current.name ).to.equal( 'scene-1' );
			expect( element.classList.contains( 'scene-scene-1' ) );
			sinon.assert.calledOnce( creatorSpy );
			sinon.assert.notCalled( destructorSpy );

			scenes.destroy();
		} );

		it( 'should show initial scene using scene path', async () => {
			const scenes = new Scenes( element, '1:1' );
			const destructorSpy = sinon.spy();
			const creatorSpy = sinon.stub().returns( destructorSpy );

			scenes.add( 'scene-1', {
				path: '/scene-1-path',
				creator: creatorSpy
			} );

			await scenes.show( '/scene-1-path' );

			expect( scenes.current.name ).to.equal( 'scene-1' );
			expect( element.classList.contains( 'scene-scene-1' ) );
			sinon.assert.calledOnce( creatorSpy );
			sinon.assert.notCalled( destructorSpy );

			scenes.destroy();
		} );

		it( 'should switch scenes using scene name', async () => {
			const scenes = new Scenes( element, '1:1' );
			const destructor1Spy = sinon.stub();
			const destructor2Spy = sinon.stub();
			const creator1Spy = sinon.stub().returns( destructor1Spy );
			const creator2Spy = sinon.stub().returns( destructor2Spy );

			scenes.add( 'scene-1', {
				path: '/scene-1-path',
				creator: creator1Spy
			} );

			scenes.add( 'scene-2', {
				path: '/scene-2-path',
				creator: creator2Spy
			} );

			await scenes.show( 'scene-1' );
			await scenes.show( 'scene-2' );

			expect( scenes.current.name ).to.equal( 'scene-2' );
			expect( element.classList.contains( 'scene-scene-1' ) ).to.false;
			expect( element.classList.contains( 'scene-scene-2' ) ).to.true;
			sinon.assert.calledOnce( destructor1Spy );
			sinon.assert.notCalled( destructor2Spy );

			scenes.destroy();
		} );

		it( 'should switch scenes using scene name', async () => {
			const scenes = new Scenes( element, '1:1' );
			const destructor1Spy = sinon.stub();
			const destructor2Spy = sinon.stub();
			const creator1Spy = sinon.stub().returns( destructor1Spy );
			const creator2Spy = sinon.stub().returns( destructor2Spy );

			scenes.add( 'scene-1', {
				path: '/scene-1-path',
				creator: creator1Spy
			} );

			scenes.add( 'scene-2', {
				path: '/scene-2-path',
				creator: creator2Spy
			} );

			await scenes.show( '/scene-1-path' );
			await scenes.show( '/scene-2-path' );

			expect( scenes.current.name ).to.equal( 'scene-2' );
			expect( element.classList.contains( 'scene-scene-1' ) ).to.false;
			expect( element.classList.contains( 'scene-scene-2' ) ).to.true;
			sinon.assert.calledOnce( destructor1Spy );
			sinon.assert.notCalled( destructor2Spy );

			scenes.destroy();
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should clear proportions from element', () => {
			const scenes = new Scenes( element, '1:1' );

			expect( element.style.width ).to.not.empty;
			expect( element.style.height ).to.not.empty;

			scenes.destroy();

			expect( element.style.width ).to.empty;
			expect( element.style.height ).to.empty;

			window.dispatchEvent( new Event( 'orientationchange' ) );
			window.dispatchEvent( new Event( 'resize' ) );

			expect( element.style.width ).to.empty;
			expect( element.style.height ).to.empty;
		} );

		it( 'should not react on popstate', () => {
			const time = sandbox.useFakeTimers();
			const scenes = new Scenes( element, '1:1' );

			scenes.add( 'scene-1', {
				path: '/scene-1',
				creator: sinon.stub().returns( sinon.spy() )
			} );

			scenes.destroy();

			window.dispatchEvent( new PopStateEvent( 'popstate', {
				state: {
					path: '/scene-1'
				}
			} ) );

			time.tick( 160 );

			expect( scenes.current ).to.undefined;
		} );

		it( 'should clear current scene', async () => {
			const scenes = new Scenes( element, '1:1' );
			const destructorSpy = sinon.spy();
			const creatorSpy = sinon.stub().returns( destructorSpy );

			scenes.add( 'scene-1', {
				path: '/scene-1',
				creator: creatorSpy
			} );

			await scenes.show( 'scene-1' );

			expect( scenes.current.name ).to.equal( 'scene-1' );

			scenes.destroy();

			expect( scenes.current ).to.null;
			sinon.assert.calledOnce( destructorSpy );
		} );
	} );
} );
