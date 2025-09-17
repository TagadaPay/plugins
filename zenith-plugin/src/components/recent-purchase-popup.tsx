import { useState, useEffect, useRef, useCallback } from "react"
import { CheckCircle } from "lucide-react"
import { useTagataConfig } from "../hooks/use-tagada-context"

function getRandomTimeAgo(): string {
  const minSeconds = 5
  const maxSeconds = 22 * 60 + 7 // 22 minutes and 7 seconds
  const randomSeconds = Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds

  if (randomSeconds < 60) {
    return `${randomSeconds} seconds ago`
  } else {
    const minutes = Math.floor(randomSeconds / 60)
    return `${minutes} minutes ago`
  }
}

function generatePurchaseMessage(firstNames: string[], flavors: string[], messageTemplate: string, productName: string) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastNameInitial = String.fromCharCode(65 + Math.floor(Math.random() * 26))
  const flavor = flavors[Math.floor(Math.random() * flavors.length)]
  const timeAgo = getRandomTimeAgo()

  return `${firstName} ${lastNameInitial}. ${messageTemplate} ${flavor} ${productName} ${timeAgo}`
}

export function RecentPurchasePopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState("")
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { config } = useTagataConfig()
  const uiText = config?.content?.text?.en?.uiText
  const productData = config?.productData

  const showNextPopup = useCallback(() => {
    const firstNames = uiText?.recentPurchase?.firstNames || ["Mike", "Sarah", "John", "Emily", "David"]
    const flavors = uiText?.recentPurchase?.flavors || ["Berry", "Mango", "Citrus"]
    const messageTemplate = uiText?.recentPurchase?.messageTemplate || "just bought"
    const productName = productData?.productName || "Zenith Shilajit Gold Gummies"
    
    setMessage(generatePurchaseMessage(firstNames, flavors, messageTemplate, productName))
    setIsVisible(true)

    // Hide after 4 seconds
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false)
      // Wait for a random interval (5-15 seconds) before showing next
      const nextDelay = Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000
      timeoutRef.current = setTimeout(showNextPopup, nextDelay)
    }, 4000) // Show for 4 seconds
  }, [])

  useEffect(() => {
    showNextPopup() // Start the first popup

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [showNextPopup])

  return (
    <div
      className={`fixed bottom-4 left-4 bg-white p-3 rounded-lg shadow-xl flex items-center gap-2 transition-all duration-500 ease-in-out z-50 border border-gray-200
      ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
    >
      <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary-color" />
      <span className="text-sm text-gray-800 whitespace-nowrap">{message}</span>
    </div>
  )
}
