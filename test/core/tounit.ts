import { expect } from 'chai';
import toUnit from '../../src/core/tounit';

describe( 'toUnit', () => {
	it( 'should return function that adds specified suffix to given value', () => {
		const toPx = toUnit( 'px' );
		const toPercent = toUnit( '%' );

		expect( toPx ).to.be.a( 'function' );
		expect( toPercent ).to.be.a( 'function' );
		expect( toPx( 10 ) ).to.equal( '10px' );
		expect( toPercent( 10 ) ).to.equal( '10%' );
	} );
} );
