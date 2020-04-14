import { expect } from 'chai';
import * as sinon from 'sinon';
import sendEvent from '../../src/core/sendevent';

describe( 'sendEvent', () => {
	it( 'should send event through ga object if it is defined (all parameters)', () => {
		const spy = sinon.stub();

		( window as any ).ga = spy;

		sendEvent( 'Category', 'Action', 'Label', 'Value' );

		sinon.assert.calledOnce( spy );
		sinon.assert.calledWithExactly( spy, 'send', 'event', 'Category', 'Action', 'Label', 'Value' );
	} );

	it( 'should send event through ga object if it is defined (required parameter)', () => {
		const spy = sinon.stub();

		( window as any ).ga = spy;

		sendEvent( 'Category', 'Action' );

		sinon.assert.calledOnce( spy );
		sinon.assert.calledWithExactly( spy, 'send', 'event', 'Category', 'Action', undefined, undefined );
	} );

	it( 'should work fine when ga object is not defined', () => {
		expect( () => {
			sendEvent( 'Category', 'Action' );
		} ).to.not.throw();
	} );

	it( 'should work fine when ga object is not a function', () => {
		( window as any ).ga = {};

		expect( () => {
			sendEvent( 'Category', 'Action' );
		} ).to.not.throw();
	} );
} );
