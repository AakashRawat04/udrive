import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/track/car/$carId')({
  component: () => <div>Hello /track/car/$carId!</div>,
})
