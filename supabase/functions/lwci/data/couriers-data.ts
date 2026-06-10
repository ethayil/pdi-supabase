export const couriersData = [
  {
    label: "UPS",
    value: "ups",
    services: [
      { label: "Express 10:30", value: "ups-express-10.30" },
      { label: "Express Saturday", value: "ups-express-saturday" },
      { label: "Express Standard", value: "ups-express-standard" },
      { label: "Express Plus 09:00", value: "ups-express-plus-09.00" },
      { label: "Express Saver 12:00", value: "ups-express-saver-12.00" },
    ],
  },
  {
    label: "FedEx",
    value: "fedex",
    services: [
      { label: "First 10:00", value: "fedex-first-10.00" },
      { label: "Express 10:30", value: "fedex-express-10.30" },
      { label: "Priority", value: "fedex-priority" },
      { label: "Priority Express Noon", value: "fedex-priority-express-noon" },
      { label: "Priority Saturday", value: "fedex-priority-saturday" },
    ],
  },
  {
    label: "Royal Mail",
    value: "royalmail",
    services: [
      { label: "Tracked 24", value: "royalmail-tracked-24" },
      { label: "Tracked 48", value: "royalmail-tracked-48" },
      { label: "Signed 24", value: "royalmail-signed-24" },
      {
        label: "Special Delivery 9:00 AM",
        value: "royalmail-special-delivery-9.00-am",
      },
      {
        label: "Special Delivery 1:00 PM",
        value: "royalmail-special-delivery-1.00-pm",
      },
    ],
  },
  {
    label: "DHL",
    value: "dhl",
    services: [{ label: "Global Priority", value: "dhl-global-priority" }],
  },
  {
    label: "Samos",
    value: "samos",
    services: [{ label: "EU Road", value: "samos-eu-road" }],
  },
  {
    label: "Collect",
    value: "collect",
    services: [
      { label: "Store Pick Up", value: "collect-store-pick-up" },
      { label: "Store Drop Off", value: "collect-store-drop-off" },
    ],
  },
];

export const trackingStatuses = [
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "On the Way", value: "on_the_way" },
  { label: "Delivered", value: "delivered" },
  { label: "Exception", value: "exception" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Returned", value: "returned" },
  { label: "Collected", value: "collected" },
  { label: "Delay", value: "delay" },
] as const;
