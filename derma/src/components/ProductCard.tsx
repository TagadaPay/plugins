import { Card, CardContent } from "./ui/card"
import Image from "next/image"
import { Button } from "./ui/button"
import { Crown } from "lucide-react"
import { Badge } from "./ui/badge"
import { PreviewPack } from "@/hooks/use-controller"
import { formatSimpleMoney } from "@tagadapay/plugin-sdk"
import { Spinner } from "./ui/spinner"
import { useState } from "react"

interface CardProps {
    pack: PreviewPack,
    selected: boolean
    popular: boolean
    mostValued: boolean
    title: string
    currency: string
    quantity: number
    image: string
    onSelect: (pack: string) => void
    onBuyNow: (packName: string) => Promise<void>
    disabled: boolean
}

export const ProductCard = ({ pack, selected, popular, title, currency, quantity, image, onSelect, onBuyNow, disabled, mostValued }: CardProps) => {
    const { preview } = pack
    const [btnBuyNowLoading, setBtnBuyNowLoading] = useState(false)
    return (
        <Card
            key={pack.bundleName}
            className={`relative cursor-pointer transition-all duration-200 ${selected ? "ring-primary-500 shadow-lg" : "hover:shadow-md"
                } ${popular ? "border-primary-500" : ""} ${mostValued ? "border-orange-500" : ""}`}
            onClick={() => onSelect(pack.bundleName)}
        >
            {popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary-500 text-white px-3 md:px-4 py-1 text-xs md:text-sm">
                        MOST POPULAR
                    </Badge>
                </div>
            )}
            {mostValued && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-orange-500 text-white px-3 md:px-4 py-1 text-xs md:text-sm">
                        MOST VALUE
                    </Badge>
                </div>
            )}
            <CardContent className="p-4 md:p-6 text-center">
                <div className="mb-4">
                    <Image
                        src={image || "/placeholder.svg"}
                        alt={`${title} - Kidsneed Laser Pen`}
                        width={200}
                        height={150}
                        className="w-full h-32 md:h-40 object-contain mx-auto"
                    />
                </div>
                <div className="text-lg md:text-2xl font-bold text-gray-900 mb-2">{title}</div>
                <div className="mb-4">
                    <span className="text-3xl md:text-4xl font-bold text-primary-500">
                        {formatSimpleMoney(preview.totalAdjustedAmount / quantity, currency)}
                    </span>
                    <span className="text-base md:text-lg text-gray-500 ml-2">/ unit</span>
                </div>
                <div className="text-green-600 font-semibold mb-2 md:mb-4">Save {formatSimpleMoney(preview.totalAmount - preview.totalAdjustedAmount, currency)}!</div>
                <div className="text-sm md:text-base text-gray-600">
                    Total: <span className="font-semibold">{formatSimpleMoney(preview.totalAdjustedAmount, currency)}</span>
                    <span className="text-gray-500 line-through ml-1">{formatSimpleMoney(preview.totalAmount, currency)}</span>
                </div>
                <div className="mt-6">
                    <Button
                        disabled={disabled}
                        size="lg"
                        className="w-full bg-primary-500 hover:bg-primary-600 text-white text-lg py-3"
                        onClick={async () => {
                            setBtnBuyNowLoading(true)
                            await onBuyNow(pack.bundleName)
                            setBtnBuyNowLoading(false)
                        }}
                    >
                        {btnBuyNowLoading && <Spinner size="sm" />} BUY NOW
                    </Button>
                </div>
            </CardContent>
        </Card>

    )
}