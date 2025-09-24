export const CustomerIdBadge = ({ customerId }: { customerId: string }) => {
  return (
    <div className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600 max-w-full overflow-hidden">
      <span className="truncate">Customer ID: {customerId}</span>
    </div>
  );
};

export const OrderIdBadge = ({
  orderId,
  label = "ID",
}: {
  orderId: string;
  label?: string;
}) => {
  return (
    <div className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 max-w-full overflow-hidden">
      <span className="truncate">
        {label}: {orderId}
      </span>
    </div>
  );
};
