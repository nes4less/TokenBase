import { generateUUID } from '../utils'

export class Image {
  blurhash: string | null
  id: string
  position: number
  value: string | null
  constructor(data?: Partial<Image>) {
    this.blurhash = data?.blurhash || null
    this.id = data?.id || generateUUID()
    this.position = data?.position ?? 0
    this.value = data?.value || null
  }
}
