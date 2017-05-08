import {isEmail} from 'validator';
import {userNameFieldFormValidation} from '../../Utils/GraphQL/QueryAndMutationsStrings';
import {formAsyncValidationQuery} from '../../Utils/GraphQL/Queries';
export const createAccountValidation = (values) => {

    // NEEDS REFACTOR TOO MANY IF ELSE

    const getValues = (prop: string) => values.get(prop);
    const parameters = ['email', 'password', 'username'].map((parameter) => getValues(parameter));
    const errors: any = {};
    //USERNAME//
    if (!parameters[2]) {
        errors.username = 'Required';
    } else if (parameters[2].length < 5) {
        errors.username = 'Should  be at least 5 characters';
    } else if (parameters[2].length > 15) {
        errors.username = 'Should be less than 15 characters';
    }
    //EMAIL//
    if (!parameters[0]) {
        errors.email = 'Required';
    } else if (isEmail(parameters[0])) {
        errors.email = 'Invalid email address';
    }

    //PASSWORD//
    if (!parameters[1]) {
        errors.password = 'Required';
    } else if (parameters[2].length < 7) {
        errors.username = 'Should  be at least 7 characters';
    }

    return errors;
};

export const asyncCreateAccountValidation = async (formValues) => {
    const userName = formValues.get('username');
    const email = formValues.get('email');
    let query;
    if (userName) {
        query = userNameFieldFormValidation({
            field: 'userName',
            value: userName
        });
        return await formAsyncValidationQuery(query);
    } else if (email) {
        // SOON™
        query = userNameFieldFormValidation({
            field: 'email',
            value: email
        });
        return await formAsyncValidationQuery(query);
    }
};
