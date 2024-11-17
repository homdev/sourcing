import { HandlerEvent, HandlerContext, Handler } from '@netlify/functions'

export type NetlifyHandler = Handler

export interface NetlifyEventHeaders {
  [key: string]: string | undefined
}

export interface NetlifyEvent extends Omit<HandlerEvent, 'headers'> {
  headers: NetlifyEventHeaders
  queryStringParameters: { [key: string]: string | undefined }
  body: string | null
}

export interface NetlifyContext extends HandlerContext {
  clientContext: { [key: string]: any }
  user: { [key: string]: any }
}