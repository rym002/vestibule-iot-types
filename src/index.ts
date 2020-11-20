import { AlexaEndpoint } from './Alexa';

export * from './Alexa';

export type AssistantType = 'alexa'

export interface Message<T> {
    payload: T;
}

export interface RequestMessage<T> extends Message<T> {
    responseTime?: {
        maxAllowed: number,
        deferred: number;
    },
    replyTopic: {
        sync?: string,
        async?: string
    }
}

export const topicConfig = {
    root: 'vestibule-bridge/',
    directive: '/alexa/directive/',
    endpoint: '/alexa/endpoint/'
}

export interface AssistantEndpoint {
    'alexa': AlexaEndpoint
}
export interface Providers<A extends AssistantType> {
    [key: string]: SubType<AssistantEndpoint, A>;
}

export type SubType<T, K extends keyof T> = T[K]
