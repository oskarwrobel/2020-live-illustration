export default function toUnit( unit: string ): ( arg0: any ) => string {
	return ( value: number ): string => value + unit;
}
