import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

const ALLOWED_DOMAIN = (process.env.ALLOWED_STUDENT_EMAIL_DOMAIN || 'du.ac.bd').toLowerCase();

/** Accepts the bare domain (rafi@du.ac.bd) as well as any department
 * subdomain DU issues under it (rafi@it.du.ac.bd, rafi@eee.du.ac.bd, ...). */
export function isDuEmail(email: string): boolean {
  const domain = (email || '').trim().toLowerCase().split('@').pop() ?? '';
  return domain === ALLOWED_DOMAIN || domain.endsWith(`.${ALLOWED_DOMAIN}`);
}

export function IsDuEmail(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDuEmail',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && isDuEmail(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `Please sign up with your DU email (must be @${ALLOWED_DOMAIN} or a department address like @it.${ALLOWED_DOMAIN}).`;
        },
      },
    });
  };
}
