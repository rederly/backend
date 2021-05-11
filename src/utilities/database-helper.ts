import * as _ from 'lodash';
import { Model, Transaction } from 'sequelize/types';
import appSequelize from '../database/app-sequelize';
import logger from './logger';
import cls = require('cls-hooked');
import { Constants } from '../constants';
const namespace = cls.getNamespace(Constants.Application.REDERLY_CLS_NAMESPACE_NAME);

/**
 * This function will run the given function in a new transaction
 * This should rarely be used since creating new transactions can result in deadlock
 * It is mainly used internally by `useDatabaseTransaction` which will reuse a transaction
 * This function simply wraps `sequelize.transaction` but adds some typing and allows us some debugging
 * The time when you would use this function is if you wanted a nested transaction not related to the parent
 * i.e. an error can occur and be corrected before doing more in the parent transaction
 * For example try to do something but if it fails ignore it and continue on 
 * @param fn An async function which you want wrapped in the transaction
 */
export const useNewDatabaseTransaction = <T = unknown>(fn: (t?: Transaction) => Promise<T>): Promise<T> => {
    logger.debug('New Transaction');
    return appSequelize.transaction((t: Transaction) => {
        return fn(t);
    });
};

/**
 * This function checks if an existing transaction has already been started, if so it will use that transaction, otherwise it starts a new one
 * This function can be used a majority of the time, this way we don't spin off more transaction then we need
 * Furthermore the only time to `useNewDatabaseTransaction` is if you want an isolated transaction
 * i.e. Try to do something, on failure do some corrective action and do other things in the database
 * @param fn An async function which you want wrapped in the transaction
 */
export const useDatabaseTransaction = <T = unknown>(fn: (t?: Transaction) => Promise<T>): Promise<T> => {
    const existingTransaction = namespace?.get('transaction');
    if(_.isNil(existingTransaction)) {
        return useNewDatabaseTransaction(fn);
    } else {
        logger.debug('Use existing transaction');
        return Promise.resolve(fn());
    }
};

/**
 * Sequelize models hide the values behind datavalues
 * Changing a value makes it a changed value
 * To optimize you can use this to assign changes and then check model.changed() before model.saved()
 * @param model is the sequelize model
 * @param changes is the fields of the model to update
 */
export const assignModelChanges = <T extends Model = Model>(model: T, changes: Partial<T>): void => {
    _.assignEntries(
        model,
        _.diffObject(model.get(), changes)
    );
};
