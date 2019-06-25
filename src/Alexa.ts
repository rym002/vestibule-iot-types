import { generateEndpointId, LocalEndpoint, Providers } from ".";
import { Alexa, Discovery, Directive, Event } from "@vestibule-link/alexa-video-skill-types";

export function getShadowEndpoint(shadow: Shadow, le?: LocalEndpoint): AlexaEndpoint | undefined {
    if (le && shadow.state && shadow.state.reported) {
        const providers = shadow.state.reported.endpoints
        if (providers) {
            const endpointId = generateEndpointId(le);
            return providers[endpointId];
        }
    }
    return undefined
}

export function getShadowEndpointMetadata(shadow: Shadow, le?: LocalEndpoint): EndpointMetadata | undefined {
    if (le && shadow.metadata && shadow.metadata.reported) {
        const providers = shadow.metadata.reported.endpoints
        if (providers) {
            const endpointId = generateEndpointId(le);
            return providers[endpointId];
        }
    }
    return undefined
}

export interface AlexaEndpoint {
    states?: EndpointState;
    capabilities?: EndpointCapability;
    info?: EndpointInfo;
}

export interface EndpointMetadata {
    states?: EndpointStateMetadata
}
export type EndpointStateMetadata = Partial<{
    [NS in Alexa.ContextInterfaces]:
    {
        [N in keyof Alexa.NamedContext[NS]]:
        Alexa.NamedContext[NS][N] extends { value: any }
        ? Alexa.NamedContext[NS][N] extends { value: string | number | boolean }
        ? ShadowMetadata
        : {
            [K in keyof Alexa.NamedContext[NS][N]['value']]: ShadowMetadata
        }
        : never
    }
}>

export type EndpointCapability = Partial<{
    [NS in keyof Discovery.NamedCapabilities]:
    Discovery.NamedCapabilities[NS] extends { supportedOperations: any }
    ? Discovery.NamedCapabilities[NS]['supportedOperations']
    : Discovery.NamedCapabilities[NS] extends { configuration: { MACAddresses: string[] } }
    ? Discovery.NamedCapabilities[NS]['configuration']['MACAddresses']
    : Discovery.NamedCapabilities[NS] extends { properties: { supported: { name: any }[] } }
    ? Discovery.NamedCapabilities[NS]['properties']['supported'][number]['name'][]
    : boolean
}>

export type EndpointInfo = Pick<Discovery.Endpoint, Exclude<keyof Discovery.Endpoint, 'capabilities'>>;



export type EndpointState = Partial<{
    [NS in Alexa.ContextInterfaces]:
    {
        [N in keyof Alexa.NamedContext[NS]]:
        Alexa.NamedContext[NS][N] extends { value: any }
        ? Partial<{
            [N2 in N]: Alexa.NamedContext[NS][N]['value']
        }>
        : never
    }[keyof Alexa.NamedContext[NS]]
}>


export interface DeltaShadow {
    timestamp?: Date,
    clientToken?: string,
    version?: number,
    state: {
        endpoints?: Providers<'alexa'>
    }
}

export interface Shadow {
    timestamp?: Date,
    clientToken?: string,
    version?: number,
    state?: {
        desired?: {
            endpoints?: Providers<'alexa'>,
            [key: string]: any
        },
        reported?: {
            endpoints?: Providers<'alexa'>,
            connected?: boolean,
            [key: string]: any
        },
        delta?: {
            [key: string]: any
        }
    }
    metadata?: {
        desired?: {
            [key: string]: ShadowMetadata
        },
        reported?: {
            endpoints?: ProvidersMetadata
        }
    }
}


export interface ShadowMetadata {
    timestamp: number
}

export interface ProvidersMetadata {
    [key: string]: EndpointMetadata;
}


export type ErrorHolder = {
    [NS in Event.Namespaces]:
    Event.NamedMessage[NS] extends { ErrorResponse: { event: { payload: any } } }
    ? {
        errorType: NS
        errorPayload: Event.NamedMessage[NS]['ErrorResponse']['event']['payload']
    }
    : never
}[Event.Namespaces]


type EventPayload = {
    [ENS in Event.Namespaces]: {
        [EN in keyof Event.NamedMessage[ENS]]:
        Event.NamedMessage[ENS][EN] extends { event: { payload: any, endpoint: any } }
        ? {
            namespace: ENS
            name: EN
            payload: Event.NamedMessage[ENS][EN]['event']['payload']
            endpoint: Event.NamedMessage[ENS][EN]['event']['endpoint']
            context?: Alexa.Context
        }
        : Event.NamedMessage[ENS][EN] extends { event: { payload: any } }
        ? {
            namespace: ENS
            name: EN
            payload: Event.NamedMessage[ENS][EN]['event']['payload']
        }
        : never
    }
}

export type DirectiveResponse = {
    [DNS in keyof Directive.NamedMessage]: {
        [DN in keyof Directive.NamedMessage[DNS]]:
        DNS extends 'Alexa'
        ? EventPayload['Alexa']['StateReport']
        : DNS extends 'Alexa.VideoRecorder'
        ? DN extends 'SearchAndRecord'
        ? EventPayload[DNS]['Alexa.SearchAndRecordResponse']
        : EventPayload['Alexa']['Response']
        : DNS extends keyof EventPayload
        ? {
            [EN in keyof EventPayload[DNS]]:
            EN extends 'ErrorResponse'
            ? never
            : EventPayload[DNS][EN]
        }[keyof EventPayload[DNS]]
        : EventPayload['Alexa']['Response']
    }
}


type VideoSkills = Extract<keyof DirectiveResponse, 'Alexa.VideoRecorder' | 'Alexa.RemoteVideoPlayer'>

export type DirectiveErrorResponse = {
    [DNS in Directive.Namespaces]:
    DNS extends 'Alexa.Discovery'
    ? EventPayload['Alexa.Discovery']['Discover.Response']
    : DNS extends keyof EventPayload
    ? {
        [DN in keyof EventPayload[DNS]]:
        DN extends 'ErrorResponse'
        ? EventPayload[DNS][DN]
        : EventPayload['Alexa']['ErrorResponse']
    }[keyof EventPayload[DNS]]
    : DNS extends VideoSkills
    ? EventPayload['Alexa.Video']['ErrorResponse'] | EventPayload['Alexa']['ErrorResponse']
    : EventPayload['Alexa']['ErrorResponse']
}
