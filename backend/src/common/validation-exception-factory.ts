import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

/**
 * Flattens class-validator's ValidationError tree into the same shape the
 * frontend already expects: { field: ["message", ...], ... }. Keeps the
 * signup/login forms' `errors.full_name[0]`-style rendering working exactly
 * as before, without any frontend changes.
 */
export function validationExceptionFactory(errors: ValidationError[]) {
  const fieldErrors: Record<string, string[]> = {};

  function collect(error: ValidationError, path: string) {
    const key = path || error.property;
    if (error.constraints) {
      fieldErrors[key] = [...(fieldErrors[key] ?? []), ...Object.values(error.constraints)];
    }
    error.children?.forEach((child) => collect(child, key));
  }

  errors.forEach((error) => collect(error, error.property));

  return new BadRequestException(fieldErrors);
}

/** Throws the same { field: [message] } shape from anywhere in a service. */
export function fieldError(field: string, message: string): never {
  throw new BadRequestException({ [field]: [message] });
}
