import { AlexaEndpoint } from './Alexa';

export * from './Alexa';

export type AssistantType = 'alexa'

interface Message<T> {
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

export interface ResponseMessage<T> extends Message<T> {
    error: boolean;
}


export interface LocalEndpoint {
    provider: string;
    host: string
}

export const topicConfig = {
    root: 'vestibule-bridge/',
    directive: '/alexa/directive/',
}

export interface AssistantEndpoint {
    'alexa': AlexaEndpoint
}
export interface Providers<A extends AssistantType> {
    [key: string]: SubType<AssistantEndpoint, A>;
}

export function generateEndpointId(le: LocalEndpoint): string {
    const deviceId = le.provider + "@" + le.host;
    return deviceId;
}

export function generateTopic(le: LocalEndpoint): string {
    const deviceId = le.provider + "/" + le.host;
    return deviceId;
}

export function toLocalEndpoint(endpointId: string): LocalEndpoint {
    const parts = endpointId.split('@');
    return {
        provider: parts[0],
        host: parts[1]
    };
}


export type SubType<T, K extends keyof T> = T[K]
