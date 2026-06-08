export const getTrackingUrl = ({
  courier,
  trackingNumber,
  postcode,
}: {
  courier: string | null;
  trackingNumber: string | null;
  postcode?: string | null;
}) => {
  if (!courier || !trackingNumber) {
    return null;
  }

  const vendor = courier.toLowerCase().replaceAll(" ", "");

  let res = null;
  if (vendor.includes("royalmail")) {
    res = `https://www.royalmail.com/track-your-item#/tracking-results/${trackingNumber}`;
  } else if (vendor.includes("amazon")) {
    res = `https://track.amazon.co.uk/tracking/${trackingNumber}`;
  } else if (vendor.includes("apc")) {
    res = `https://www.aftership.com/track/apc-overnight/${trackingNumber}`;
  } else if (vendor.includes("dhl")) {
    res = `https://www.dhl.com/gb-en/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingNumber}`;
  } else if (vendor.includes("ups")) {
    res = `https://www.ups.com/track?loc=en_US&tracknum=${trackingNumber}`;
  } else if (vendor.includes("fedex")) {
    res = `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
  } else if (vendor.includes("dpd")) {
    res = `https://www.dpd.co.uk/apps/tracking/?reference=${trackingNumber}&postcode=${postcode}`;
  }

  return res;
};
