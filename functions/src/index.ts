import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp()
const firestore = admin.firestore();

export interface BudgetItem {
    uid: string;
    name: string;
    date: admin.firestore.Timestamp;
    price: number;
    forUser: string;
    month?: number;
    day?: number;
    year?: number;
}

export const aggregate = functions.firestore.document('budget-items/{documentId}').onCreate(async(snapshot, context) => {    
    return firestore.runTransaction(async(transaction) => {
        
        const data: BudgetItem = snapshot.data() as any;
        
        const aggregateRef = firestore.doc(`aggregate/${data.forUser}`);
        const aggDoc = await transaction.get(aggregateRef);
        let aggData = aggDoc.data();
        if(aggData === undefined) {
            aggData = {};
        }

        const lastTotal = aggData.total ? aggData.total : 0;
        const last5 = aggData.last5 ? aggData.last5 : [];

        const next = {
            total: lastTotal + data.price,
            last5: [data, ...last5.slice(0, 4)]
        }
        return transaction.set(aggregateRef, next);
    })
})

// export const migrateMonthly = functions.https.onCall(async(data, context) => {
//     // update: cron "0 0 1 * *"
//     if(!context) {
//         console.log('failed, no context')
//         return false;
//     }
//     if(!context.auth) {
//         console.log('failed, no auth');
//         return false;
//     }

//     const SUCCESS_MESSAGE = {data: 'success'};
//     const FAIL_MESSAGE = {data: 'fail'};
//     const NOT_NECESSARY_MESSAGE = {data: 'no migration necessary'};

//     const thisUid = context.auth.uid;
//     return firestore.runTransaction(async transaction => {
//         const aggRef = firestore.doc(`aggregate/${thisUid}`);

//         const aggregateDoc = await transaction.get(aggRef);
//         const aggData = aggregateDoc.data();
//         if(!aggData) {
//             return FAIL_MESSAGE;
//         }
//         const lastTotal = aggData.total || 0;
//         const lastDate = (aggData.last5[0].date as admin.firestore.Timestamp).toDate();
//         const lastDateObj = {year: lastDate.getFullYear(), month: lastDate.getMonth()}
//         const lastDateStr = `${lastDateObj.year}${lastDateObj.month}`;
//         const currentDate = new Date();
//         const currentDateObj = {year: currentDate.getFullYear(), month: currentDate.getMonth()}

//         if(currentDateObj.year > lastDateObj.year || (currentDateObj.year === lastDateObj.year && currentDateObj.month > lastDateObj.month)) {
//             return transaction.update(aggRef, {...aggData, total: 0, past: [{lastDateStr:lastTotal}, aggData.past.slice(0,11)]})
//         } else {
//             return NOT_NECESSARY_MESSAGE;
//         }


//     })
// })
