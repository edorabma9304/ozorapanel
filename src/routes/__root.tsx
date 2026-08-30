import { createRootRoute, Outlet } from '@tanstack/react-router'
import { HalamanGalat } from '@/components/layout/halaman-galat'

export const Route = createRootRoute({
  component: Outlet,
  errorComponent: ({ error, reset }) => <HalamanGalat error={error} reset={reset} />,
})
