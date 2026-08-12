import configPromise from '@payload-config'
import { getPayload } from 'payload'

let payloadClientPromise: ReturnType<typeof getPayload> | null = null

export async function getPayloadClient() {
  if (!payloadClientPromise) {
    payloadClientPromise = getPayload({ config: configPromise })
  }

  return payloadClientPromise
}
