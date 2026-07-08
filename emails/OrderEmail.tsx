import OrderConfirmationEmail from "./OrderConfirmation";
import OrderShippingEmail from "./OrderShipping";

export type OrderEmailStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "on_the_way"
  | "delay"
  | "delivered"
  | "collected"
  | "exception"
  | "cancelled"
  | "returned";

export interface OrderEmailItem {
  name: string;
  sku?: string;
  quantity: number;
  image?: string;
}

export interface OrderEmailProps {
  reference: string;
  status: OrderEmailStatus;
  fullname: string;
  address1: string;
  address2?: string;
  town: string;
  city?: string;
  postcode: string;
  country: string;
  deliveryDate: number;
  weight: number;
  items?: OrderEmailItem[];
  courier?: string;
  trackingNumber?: string;
  service?: string;
  signedBy?: string;
  deliveredAt?: number;
  externalComments?: string;
  sendDate?: number;
  exceptionReason?: string;
  orderUrl: string;
}

export const OrderEmail = (props: OrderEmailProps) => {
  const { status } = props;

  // Confirmation email style for pending or processing
  if (status === "pending" || status === "processing") {
    return <OrderConfirmationEmail {...props} />;
  }

  // Shipping email style for shipped, delay, delivered, etc.
  return <OrderShippingEmail {...props} />;
};

OrderEmail.PreviewProps = {
  reference: "ORD-98273-XYZ",
  status: "processing",
  fullname: "John Doe",
  address1: "123 Logistics Hub Road",
  address2: "Suite 400",
  town: "Reading",
  city: "Berkshire",
  postcode: "RG1 1AF",
  country: "United Kingdom",
  deliveryDate: Date.now() + 86400000 * 2,
  weight: 1250,
  items: [
    { name: "Premium Wireless Keyboard", sku: "KB-WIRE-01", quantity: 1 },
    { name: "Ergonomic USB Mouse", sku: "MS-ERGO-02", quantity: 2 },
  ],
  courier: "DPD",
  trackingNumber: "DPD123456789",
  service: "Next Day Tracked",
  orderUrl: "https://example.com/orders/ORD-98273-XYZ",
} satisfies OrderEmailProps;

export default OrderEmail;
