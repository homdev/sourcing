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
  clientContext: Record<string, unknown>
  user: Record<string, unknown>
  callbackWaitsForEmptyEventLoop: boolean
  functionName: string
  functionVersion: string
  invokedFunctionArn: string
  memoryLimitInMB: string
  awsRequestId: string
  logGroupName: string
  logStreamName: string
  identity: Record<string, unknown> | undefined
  done: (error?: Error, result?: unknown) => void
}