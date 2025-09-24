"use client";

import { Button } from "@/components/ui/button";
// import { RiEditLine } from "@remixicon/react";
import { CustomerIdBadge, OrderIdBadge } from "@/components/AdvancedBadges";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RiEditLine } from "@remixicon/react";
import { useCustomer, useCustomerInfos } from "@tagadapay/plugin-sdk/react";
import { MapPin, Monitor, Package, User } from "lucide-react";
import { useState } from "react";

const InfoCard = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => {
  return (
    <div className="group h-full rounded-lg border border-gray-200 bg-white transition-all hover:border-gray-300 hover:shadow-md">
      <div className="border-b border-gray-100 bg-gray-50/50 p-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-white p-2 shadow-sm">
            <Icon className="h-5 w-5 text-gray-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
};

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
}) => {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-500">{label}</label>
      <div className="mt-1 text-gray-900">{value}</div>
    </div>
  );
};

const AddressDisplay = ({
  address,
  type,
}: {
  address: any;
  type: "Billing" | "Shipping";
}) => {
  if (!address) return null;

  return (
    <div className="rounded-md bg-gray-50 p-3">
      <label className="mb-2 block text-sm font-medium text-gray-500">
        {type} Address
      </label>
      <div className="space-y-1 text-gray-900">
        <p className="font-medium">
          {address.firstName} {address.lastName}
        </p>
        <p>{address.address1}</p>
        <p>
          {address.city}, {address.state} {address.zip}
        </p>
        <p>{address.country}</p>
        {address.phone && (
          <p className="mt-2 text-sm text-gray-600">{address.phone}</p>
        )}
      </div>
    </div>
  );
};

export default function MyAccountTab() {
  const { customer } = useCustomer();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
  });

  const { data, isLoading, refetch } = useCustomerInfos({
    customerId: customer?.id,
    enabled: Boolean(customer?.id),
  });

  const customerData = data?.customer;

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement update customer info
    setIsEditing(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="mt-4 text-sm text-emerald-600">
            Loading your account information...
          </p>
        </div>
      </div>
    );
  }

  console.log(customerData);
  if (!customerData) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            My Account
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <CustomerIdBadge customerId={customerData.id} />
            {customerData.lastOrderId && (
              <OrderIdBadge
                orderId={customerData.lastOrderId}
                label="Last Order"
              />
            )}
          </div>
        </div>
        <Button
          onClick={() => {
            setEditForm({
              email: customerData.email || "",
              firstName: customerData.firstName || "",
              lastName: customerData.lastName || "",
            });
            setIsEditing(true);
          }}
          className="flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <RiEditLine className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        <InfoCard title="Personal Information" icon={User}>
          <InfoItem label="Email" value={customerData.email} />
          <InfoItem
            label="Name"
            value={
              <span className="font-medium">
                {customerData.firstName} {customerData.lastName}
              </span>
            }
          />
          {/* <InfoItem
            label="Member Since"
            value={format(
              new Date(customerData.createdAt || ""),
              "MMMM d, yyyy"
            )}
          /> */}
        </InfoCard>

        <InfoCard title="Account Statistics" icon={Package}>
          <InfoItem
            label="Total Orders"
            value={
              <span className="font-medium text-lg">
                {customerData.orders?.length || 0}
                <span className="ml-1 text-sm font-normal text-gray-500">
                  orders
                </span>
              </span>
            }
          />
          <InfoItem
            label="Active Subscriptions"
            value={
              <span className="font-medium text-lg">
                {customerData.subscriptions?.length || 0}
                <span className="ml-1 text-sm font-normal text-gray-500">
                  active
                </span>
              </span>
            }
          />
          <InfoItem
            label="Marketing Preferences"
            value={
              <span
                className={
                  customerData.acceptsMarketing
                    ? "text-emerald-600"
                    : "text-gray-500"
                }
              >
                {customerData.acceptsMarketing
                  ? "Subscribed to newsletters"
                  : "Not subscribed to newsletters"}
              </span>
            }
          />
        </InfoCard>

        <InfoCard title="Addresses" icon={MapPin}>
          <div className="space-y-4">
            <AddressDisplay
              address={customerData.billingAddress}
              type="Billing"
            />
            <AddressDisplay
              address={customerData.shippingAddress}
              type="Shipping"
            />
          </div>
        </InfoCard>

        <InfoCard title="System Information" icon={Monitor}>
          <InfoItem
            label="Browser"
            value={
              <div className="flex items-center gap-2">
                <span>
                  {customerData.device?.browser}{" "}
                  {customerData.device?.browserVersion}
                </span>
              </div>
            }
          />
          <InfoItem
            label="Operating System"
            value={`${customerData.device?.os} ${customerData.device?.osVersion}`}
          />
          <InfoItem
            label="Location"
            value={
              <div className="flex flex-wrap items-center gap-1">
                <span>{customerData.device?.geoData?.city}</span>
                <span>•</span>
                <span>{customerData.device?.geoData?.regionName}</span>
                <span>•</span>
                <span>{customerData.device?.geoData?.country}</span>
              </div>
            }
          />
        </InfoCard>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="mt-1 w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                First Name
              </label>
              <Input
                type="text"
                value={editForm.firstName}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                className="mt-1 w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Last Name
              </label>
              <Input
                type="text"
                value={editForm.lastName}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, lastName: e.target.value }))
                }
                className="mt-1 w-full"
              />
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                onClick={() => setIsEditing(false)}
                type="button"
                variant="ghost"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
