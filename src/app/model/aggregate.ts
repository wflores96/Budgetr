import { BudgetItem } from './budget-item';

export interface Aggregate {
    total: number;
    last5: BudgetItem[];
    lastMonthTotal?: number;
    lastMonthId?: number;
}
