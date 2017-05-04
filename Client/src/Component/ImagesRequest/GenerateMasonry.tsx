import * as React from 'react';
import {FullCard} from '../Card/FullCard';

export const GenerateMasonry = (parameters: { images: any[], deletePin: boolean, deleteCardFunction?: any, id?: string }) => {
    const {images, deletePin, deleteCardFunction, id} = parameters;
    console.log(parameters, 'parametri')
    const myItems = [];
    let loop = 0;
    if (images && images.length >= 1) {
        while (loop < images.length) {
            myItems.push(
                <FullCard key={ images[loop].id } LoggedInUserID={ id }
                          deletePin={ deletePin } deleteCard={ deleteCardFunction }
                          cell={ loop } singleImage={ images[loop] }
                />
            );

            loop = loop + 1;
        }
    } else {
        myItems.push(<div key={ 123 }> Wops nothing here...</div>);
    }

    return myItems;
};