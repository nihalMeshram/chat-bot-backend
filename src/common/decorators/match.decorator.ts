import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * Custom decorator to validate that the value of a property matches another property's value.
 * Useful for scenarios like confirming passwords (e.g., `password` and `confirmPassword`).
 *
 * @param property - The name of the property to match against.
 * @param validationOptions - Optional validation options (e.g., custom error message).
 */
export function Match(property: string, validationOptions?: ValidationOptions) {
  return (object: Record<string, any>, propertyName: string) => {
    registerDecorator({
      name: 'Match', // Unique name of the custom validator
      target: object.constructor, // Target class where this decorator is applied
      propertyName, // Property on which this decorator is used
      constraints: [property], // Property to match with (passed as constraint)
      options: validationOptions, // Any custom validation options
      validator: {
        /**
         * Validator logic to check if the current property's value matches the target property.
         */
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },

        /**
         * Default error message returned when validation fails.
         */
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must match ${args.constraints[0]}`;
        },
      },
    });
  };
}
