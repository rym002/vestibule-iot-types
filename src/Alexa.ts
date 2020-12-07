import { Alexa, Directive, Discovery, Event } from "@vestibule-link/alexa-video-skill-types";
import { Message } from ".";


export interface AlexaEndpoint extends EndpointState {

}

export type Metadata = {
    timestamp: number
}

export type ShadowMetadata<T> =
    T extends string | number | boolean | symbol
    ? Metadata
    : T extends string[] | number[] | boolean[] | symbol[]
    ? Metadata[]
    : {
        [K in keyof T]: ShadowMetadata<T[K]>
    }

export type EndpointCapability = Partial<{
    [NS in keyof Discovery.NamedCapabilities]:
    Discovery.NamedCapabilities[NS] extends { supportedOperations: any }
    ? Discovery.NamedCapabilities[NS]['supportedOperations']
    : Discovery.NamedCapabilities[NS] extends { keys: any }
    ? Discovery.NamedCapabilities[NS]['keys']
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

export interface ShadowState<T> {
    desired?: T,
    reported?: T,
    delta?: T
}
export interface Shadow<T> {
    timestamp?: Date,
    clientToken?: string,
    version?: number,
    state?: ShadowState<T>
    metadata?: ShadowMetadata<ShadowState<T>>
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
        ? Event.NamedMessage[ENS][EN] extends { event: { payload: any, header: { namespace: 'Alexa.VideoRecorder' } } }
        ? {
            namespace: ENS
            name: EN
            payload: Event.NamedMessage[ENS][EN]['event']['payload']
            context?: {
                properties: {
                    [CN in keyof Alexa.NamedContext['Alexa.VideoRecorder']]: Alexa.NamedContext['Alexa.VideoRecorder'][CN]
                }[keyof Alexa.NamedContext['Alexa.VideoRecorder']][]
            }
        }
        : {
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

export interface ResponseMessage<T> extends Message<T> {
    error: boolean;
    stateChange?: EndpointState
}
