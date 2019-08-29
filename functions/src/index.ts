import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { apiHandler } from './controllers/api';

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

// export const heat = functions.pubsub.schedule("*/2 * * * *").onRun(async(context) => {
//     const TEST_ID = 'budget-items/TEST';

//     // create the document to heat the aggregate fxn
//     return firestore.doc(TEST_ID).create({
//         forPing: true
//     })
//     // delete the doc to heat the deleteDoc fxn
//     .then(w => {
//         console.log('ping doc created', w);
//         return firestore.doc(TEST_ID).delete()
//     })
//     .catch(err => {
//         console.log('heat failed with error ', err);
//     })
// });

export const api = functions.https.onCall(apiHandler);
