/**
 * Isn't being used right now since we relaxed renderer validation
 * Code is no longer valid since we upgraded joi from @hapi/joi 15 to joi 17
 */
// import * as Joi from 'joi';
// import logger from '../utilities/logger';

// // https://github.com/sideway/joi/issues/1442#issuecomment-574915234
// export const JoiToStringedStringConvertible: Joi.Extension = {
//     base: Joi.string(),
//     name: 'toStringedString',
//     // value was not a string so we need to coerce it, this any is to check if it has toString
//     // value is defined as any in Joi's Extension interface
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     coerce(value: any, state: Joi.State, options: Joi.ValidationOptions): unknown {
//         if (typeof (value) === 'string') {
//             return value;
//         }
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         else if (typeof (value?.toString) === 'function') {
//             logger.warn(JSON.stringify({
//                 value,
//                 responsePath: state.path,
//                 message: 'Non string value passed to toStringedString, calling toString',
//                 debug: options.context?.debug
//             }));
//             return value.toString();
//         }
//         return value;
//     },
// };

// type RederlyExtendedJoi = typeof Joi & {
//     toStringedString: typeof Joi.string;
// };

// export const RederlyExtendedJoi = Joi.extend([
//     JoiToStringedStringConvertible
// ]) as RederlyExtendedJoi;
