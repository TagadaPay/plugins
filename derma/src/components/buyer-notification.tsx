"use client"

import { useState, useEffect } from "react"
import { CheckCircle } from "lucide-react"

interface Notification {
  name: string
  product: string
  timeAgo: string
}

const names = [
  "Michael R.",
  "Sarah L.",
  "David K.",
  "Emily S.",
  "Jessica B.",
  "Chris P.",
  "Amanda G.",
  "James H.",
  "Olivia M.",
  "Daniel W.",
]
const products = ["Single Pack", "Double Pack", "Triple Pack"]

const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const generateRandomNotification = (): Notification => {
  const randomName = names[getRandomInt(0, names.length - 1)]
  const randomProduct = products[getRandomInt(0, products.length - 1)]
  const randomTimeInSeconds = getRandomInt(5, 29 * 60) // 5 seconds to 29 minutes
  let timeAgoString: string

  if (randomTimeInSeconds < 60) {
    timeAgoString = `${randomTimeInSeconds} seconds ago`
  } else {
    const minutes = Math.floor(randomTimeInSeconds / 60)
    timeAgoString = `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  }

  return {
    name: randomName,
    product: randomProduct,
    timeAgo: timeAgoString,
  }
}

export function BuyerNotification() {
  const [notification, setNotification] = useState<Notification | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const showNotification = () => {
      setNotification(generateRandomNotification())
      setIsVisible(true)

      const hideTimer = setTimeout(() => {
        setIsVisible(false)
      }, 5000) // Notification visible for 5 seconds

      return () => clearTimeout(hideTimer)
    }

    // Show first notification after a short delay
    const initialDelay = setTimeout(showNotification, 2000)

    // Set interval for subsequent notifications
    const interval = setInterval(showNotification, 15000) // New notification every 15 seconds

    return () => {
      clearTimeout(initialDelay)
      clearInterval(interval)
    }
  }, [])

  if (!notification) return null

  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3 transition-all duration-500 ease-in-out ${
        isVisible ? "animate-slide-in-bottom opacity-100" : "animate-slide-out-bottom opacity-0"
      }`}
    >
      <CheckCircle className="h-6 w-6 text-green-500" />
      <p className="text-sm font-medium text-gray-800">
        <span className="font-bold">{notification.name}</span> just bought{" "}
        <span className="font-bold">{notification.product}</span> {notification.timeAgo}
      </p>
    </div>
  )
}
