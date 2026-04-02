import { v4 as uuidv4 } from 'uuid'

export const generateUUID = (): string => uuidv4()
export const generateDateString = (): string => new Date().toISOString()
export const generateHexColor = (): string =>
  '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
