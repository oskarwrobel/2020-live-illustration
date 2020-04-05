declare let ga: any;

/**
 * Wrapper for GoogleAnalytics object.
 */
export default function sendEvent( category: string, action: string, label?: string, value?: any ): any {
	if ( 'ga' in window && typeof ga === 'function' ) {
		ga( 'send', 'event', category, action, label, value );
	}
}
