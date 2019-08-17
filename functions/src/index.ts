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
    forPing?: boolean;
}

export const aggregate = functions.firestore.document('budget-items/{documentId}').onCreate(async(snapshot, context) => {    
    const data: BudgetItem = snapshot.data() as any;
    if(data.forPing) {
        console.log('function kept warm');
        return false;
    }

    return firestore.runTransaction(async(transaction) => {
        
        const aggregateRef = firestore.doc(`aggregate/${data.forUser}`);
        const aggDoc = await transaction.get(aggregateRef);
        let aggData = aggDoc.data();
        if(aggData === undefined) {
            aggData = {};
        }

        const lastTotal = aggData.total ? aggData.total : 0;

        const next = {
            total: lastTotal + data.price,
            
        }
        return transaction.set(aggregateRef, next);
    });
});

export const deleteDoc = functions.firestore.document('budget-items/{documentId}').onDelete(async(snapshot, context) => {
    const data: BudgetItem = snapshot.data() as any;
    if(data.forPing) {
        console.log('function kept warm');
        return false;
    }

    return firestore.runTransaction(async(transaction) => {
        const currMonth = new Date().getMonth();
        const docMonth = data.date.toDate().getMonth();
        if(currMonth !== docMonth) {
            console.log('delete not for same month, ignore');
            return false;
        }

        const aggregateRef = firestore.doc(`aggregate/${data.forUser}`);
        const aggDoc = await transaction.get(aggregateRef);
        let aggData = aggDoc.data();
        if(!aggData) {
            aggData = {};
        }

        let total: number = aggData.total ? aggData.total : 0;

        if (total > data.price) {
            total -= data.price;
        }

        const next = {
            total
        }

        return transaction.set(aggregateRef, next);
    });
});

export const heat = functions.pubsub.schedule("2 * * * *").onRun(async(context) => {
    const TEST_ID = 'budget-items/TEST';

    // create the document to heat the aggregate fxn
    return firestore.doc(TEST_ID).create({
        forPing: true
    })
    // delete the doc to heat the deleteDoc fxn
    .then(w => {
        console.log('ping doc created', w);
        return firestore.doc(TEST_ID).delete()
    })
    .catch(err => {
        console.log('heat failed with error ', err);
    })
});

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
