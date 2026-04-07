export class AppError extends Error {
	constructor(
		public code: string,
		message: string,
		public statusCode: number = 400,
	) {
		super(message)
		this.name = 'AppError'
	}

	toJSON() {
		return {
			error: {
				code: this.code,
				message: this.message,
			},
		}
	}
}

export class ValidationError extends AppError {
	constructor(message: string) {
		super('VALIDATION_ERROR', message, 400)
		this.name = 'ValidationError'
	}
}

export class NotFoundError extends AppError {
	constructor(message = 'Not found') {
		super('NOT_FOUND', message, 404)
		this.name = 'NotFoundError'
	}
}

export class RateLimitError extends AppError {
	constructor(message = 'Too many requests') {
		super('RATE_LIMITED', message, 429)
		this.name = 'RateLimitError'
	}
}

export class BenchmarkError extends AppError {
	constructor(message: string) {
		super('BENCHMARK_ERROR', message, 500)
		this.name = 'BenchmarkError'
	}
}
