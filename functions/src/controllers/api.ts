import * as functions from 'firebase-functions';

export const apiHandler = async(data: any, context: functions.https.CallableContext) => {
    if (!data.endpoint) {
        console.log('no endpoint in request');
        return {data: false};
    }
    
    switch(data.endpoint) {
        case 'hello': {
            return {
                data: 'world'
            };
        }
        case 'world': {
            return {
                data: 'hello'
            };
        }
        default:
            return { data: `endpoint ${data.endpoint} not recognized` };
    }
}
