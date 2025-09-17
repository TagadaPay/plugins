"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Crown, Minus, Plus, Trash2 } from "lucide-react"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  selectedOption: {
    quantity: number
    price: number
    originalPrice: number
    savings: number
    image: string
    title: string
  } | null
}

export function CartDrawer({ isOpen, onClose, selectedOption }: CartDrawerProps) {
  const [itemQuantity, setItemQuantity] = useState(selectedOption?.quantity || 1)

  useEffect(() => {
    if (selectedOption) {
      setItemQuantity(selectedOption.quantity)
    }
  }, [selectedOption])

  const handleQuantityChange = (delta: number) => {
    setItemQuantity((prev) => Math.max(1, prev + delta))
  }

  const currentPrice = selectedOption ? selectedOption.price : 0
  const total = (currentPrice * itemQuantity) / (selectedOption?.quantity || 1) // Adjust total based on selected option's price per unit
  const vipDiscount = 0.2 // 20% off for VIP
  const vipTotal = total * (1 - vipDiscount)

  if (!selectedOption) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-4">
          {selectedOption && (
            <div className="flex items-center space-x-4 border-b pb-4 mb-4">
              <Image
                src={selectedOption.image || "/placeholder.svg"}
                alt={selectedOption.title}
                width={80}
                height={80}
                className="rounded-md object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{selectedOption.title}</h3>
                <p className="text-gray-600 text-sm">
                  {selectedOption.quantity} Derma Pen{selectedOption.quantity > 1 ? "s" : ""}
                </p>
                <div className="flex items-center mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-transparent"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={itemQuantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="mx-2 text-lg font-medium">{itemQuantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-transparent"
                    onClick={() => handleQuantityChange(1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="ml-auto font-bold text-lg">
                    ${((currentPrice / selectedOption.quantity) * itemQuantity).toFixed(2)}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500">
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-bold">Total:</span>
            <span className="text-xl font-bold text-orange-600">${total.toFixed(2)}</span>
          </div>
          <Button size="lg" className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-3 mb-3 relative">
            <Crown className="h-5 w-5 mr-2" />
            VIP Checkout
            <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-red-600 text-xs font-bold px-2 py-1 rounded-full">
              20% OFF
            </span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full border-gray-300 text-gray-800 hover:bg-gray-50 bg-transparent"
          >
            Guest Checkout
          </Button>
          <p className="text-center text-xs text-gray-500 mt-3">
            Your total for VIP Checkout will be ${vipTotal.toFixed(2)}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
