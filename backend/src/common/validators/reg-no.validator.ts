import { registerDecorator, ValidationOptions } from 'class-validator';

const REG_NO_PATTERN = /^\d{1,10}$/;

export function isValidRegNo(value: string): boolean {
  return REG_NO_PATTERN.test((value || '').trim());
}

export function IsRegNo(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isRegNo',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && isValidRegNo(value);
        },
        defaultMessage() {
          return 'Registration number must be numeric and at most 10 digits.';
        },
      },
    });
  };
}
