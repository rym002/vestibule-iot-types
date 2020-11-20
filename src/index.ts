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

export function endpointTopicPrefix(clientId:string, assistant:AssistantType, endpointId:string){
    return `vestibule-bridge/${clientId}/${assistant}/endpoint/${endpointId}/`
}

export interface AssistantEndpoint {
    'alexa': AlexaEndpoint
}
export interface Providers<A extends AssistantType> {
    [key: string]: SubType<AssistantEndpoint, A>;
}

export type SubType<T, K extends keyof T> = T[K]
