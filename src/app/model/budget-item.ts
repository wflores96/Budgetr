export interface BudgetItem {
    uid: string;
    name: string;
    date: firebase.firestore.Timestamp;
    price: number;
    forUser: string;
    month?: number;
    day?: number;
    year?: number;
}
