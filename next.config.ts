import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/dashboard/checkin', destination: '/check-in/sleep', permanent: true },
      { source: '/dashboard/mood-checkin', destination: '/check-in/mood', permanent: true },
      { source: '/dashboard/nap-checkin', destination: '/check-in/nap', permanent: true },
      { source: '/dashboard/condition-checkin', destination: '/check-in/condition', permanent: true },
    ]
  },
}

export default nextConfig
