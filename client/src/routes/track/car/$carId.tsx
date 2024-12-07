import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/track/car/$carId')({
  loader: () => {
    throw redirect({ to: '/' })
  }
})
