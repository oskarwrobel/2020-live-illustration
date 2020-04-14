import { expect } from 'chai';
import * as sinon from 'sinon';
import setProportions from '../../src/core/setproportions';

describe( 'setProportions', () => {
	let sandbox: sinon.SinonSandbox;

	beforeEach( () => {
		sandbox = sinon.createSandbox();
	} );

	afterEach( () => {
		sandbox.reset();
	} );

	describe( '16:9', () => {
		it( 'should set a proper height to given element (according to screen size) to preserve aspect ratio', () => {
			const element = document.createElement( 'div' );

			sandbox.stub( window, 'innerWidth' ).get( () => 1280 );
			sandbox.stub( window, 'innerHeight' ).get( () => 1000 );

			setProportions( element, '16:9' );

			expect( element.style.width ).to.equal( '1280px' );
			expect( element.style.height ).to.equal( '720px' );
		} );

		it( 'should set a proper width to given element (according to screen size) to preserve aspect ratio', () => {
			const element = document.createElement( 'div' );

			sandbox.stub( window, 'innerWidth' ).get( () => 2000 );
			sandbox.stub( window, 'innerHeight' ).get( () => 720 );

			setProportions( element, '16:9' );

			expect( element.style.width ).to.equal( '1280px' );
			expect( element.style.height ).to.equal( '720px' );
		} );

		it( 'should work ok when proportions are already preserved', () => {
			const element = document.createElement( 'div' );

			sandbox.stub( window, 'innerWidth' ).get( () => 1280 );
			sandbox.stub( window, 'innerHeight' ).get( () => 720 );

			setProportions( element, '16:9' );

			expect( element.style.width ).to.equal( '1280px' );
			expect( element.style.height ).to.equal( '720px' );
		} );
	} );

	describe( '1:1', () => {
		it( 'should set a proper height to given element (according to screen size) to preserve aspect ratio', () => {
			const element = document.createElement( 'div' );

			sandbox.stub( window, 'innerWidth' ).get( () => 1500 );
			sandbox.stub( window, 'innerHeight' ).get( () => 1000 );

			setProportions( element, '1:1' );

			expect( element.style.width ).to.equal( '1000px' );
			expect( element.style.height ).to.equal( '1000px' );
		} );

		it( 'should set a proper width to given element (according to screen size) to preserve aspect ratio', () => {
			const element = document.createElement( 'div' );

			sandbox.stub( window, 'innerWidth' ).get( () => 1000 );
			sandbox.stub( window, 'innerHeight' ).get( () => 1500 );

			setProportions( element, '1:1' );

			expect( element.style.width ).to.equal( '1000px' );
			expect( element.style.height ).to.equal( '1000px' );
		} );

		it( 'should work ok when proportions are already preserved', () => {
			const element = document.createElement( 'div' );

			sandbox.stub( window, 'innerWidth' ).get( () => 1000 );
			sandbox.stub( window, 'innerHeight' ).get( () => 1000 );

			setProportions( element, '1:1' );

			expect( element.style.width ).to.equal( '1000px' );
			expect( element.style.height ).to.equal( '1000px' );
		} );
	} );
} );
