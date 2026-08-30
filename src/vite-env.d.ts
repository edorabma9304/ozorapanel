/// <reference types="vite/client" />

declare module '@driver' {
  import type { AdapterData } from '@/lib/adapter/kontrak'
  const adapter: AdapterData
  export default adapter
}
