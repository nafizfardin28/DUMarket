import { registerDecorator, ValidationOptions } from 'class-validator';

// Must start with "01" and be at most 11 digits total, matching the
// frontend's signup form rule for Bangladeshi mobile numbers.
const PHONE_PATTERN = /^01\d{0,9}$/;

export function isValidPhone(value: string): boolean {
  return PHONE_PATTERN.test((value || '').trim());
}

export function IsDuPhone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDuPhone',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && isValidPhone(value);
        },
        defaultMessage() {
          return 'Phone number must start with 01 and be at most 11 digits.';
        },
      },
    });
  };
}
