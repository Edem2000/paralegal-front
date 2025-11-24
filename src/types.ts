export type Kind =
    | 'phone'
    | 'email'
    | 'card'
    | 'passport'
    | 'tin'
    | 'dob'
    | 'address'
    | 'person_name'
    | 'medical'
    | 'custom';

export type Source = 'algorithm' | 'llm' | 'final';

export interface Change {
    actor: Source;
    kind: string;
    before: string;
    after: string;
    start: number;
    end: number;
    contextBefore?: string;
    contextAfter?: string;
    confidence?: number;
    resolution?: string;
}

export interface ApiResponse {
    finalText: string;
    finalSpans?: object[];   // можно типизировать позже
    changes?: Change[];   // ожидаем, что бэкенд вернёт это поле
}
