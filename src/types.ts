export type Kind =
    | 'phone'
    | 'email'
    | 'card'
    | 'passport'
    | 'pinfl'
    | 'tin'
    | 'dob'
    | 'address'
    | 'person_name'
    | 'medical'
    | 'custom';

export type LlmKind =
    | 'date_of_birth'
    | 'residence_address'
    | 'person_name'
    | 'medical_condition'
    | 'company_name'
    | 'company_address'
    | 'contract_number'
    | 'contract_date'

export type Source = 'algorithm' | 'llm' | 'final';

export interface Change {
    id: string;
    transactionId: string;
    runId?: string;
    actor: string,
    kind: string,
    before: string,
    beforeDetails: {
        start: number,
        end: number,
        contextBefore: string,
        contextAfter: string,
    },
    after: string,
    afterDetails: {
        start: number,
        end: number,
        contextBefore: string,
        contextAfter: string,
    },
    confidence: number,
    resolution: string,
    createdAt: string,
}

export interface ApiResponse {
    finalText: string;
    finalSpans?: object[];   // можно типизировать позже
    changes?: Change[];   // ожидаем, что бэкенд вернёт это поле
}

export interface Transaction {
    id: string;               // HexString
    choices: string[];
    customQueries: string[];

    inputText: string;
    finalText: string;
    stats: Record<string, any>;
    status: string;
    errorMessage?: string;

    requestedAt: string;
    processedAt?: string;
    createdAt: string;
}

export interface TransactionsPageResponse {
    total: number;
    page: number;
    limit: number;
    pages: number;
    transactions: Transaction[];
}


export type GetTransactionResponseDto = {
    transaction: Transaction;
    changes: Change[];
};