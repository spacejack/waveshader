interface Timespan {
	start: number
	duration: number
}

function Timespan (start = 0, duration = 0): Timespan {
	return {start, duration}
}

export default Timespan
