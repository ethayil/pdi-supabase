import type { Metadata } from "next";
import { Suspense } from "react";
import type { User } from "@/auth";
import CheckoutForm from "@/components/checkout/checkout-form";
import { CheckoutSkeleton } from "@/components/checkout/checkout-skeleton";
import { DashboardHeader } from "@/components/dashboard-header";
import { getAddresses } from "@/data/addresses";
import { getCartItems } from "@/data/cart";
import { getOrgUsers } from "@/data/users";
import { getSession } from "@/lib/auth/get-session";
import type { Params } from "@/types/globals";

export const metadata: Metadata = {
  title: "Checkout | PDi",
  description: "PDi Checkout",
};

export default async function CheckoutPage({ params }: { params: Params }) {
  const { orgId } = await params;
  const { user } = await getSession();

  if (!user) {
    return null;
  }

  return (
    <>
      <DashboardHeader title="Checkout" sticky />
      <Suspense fallback={<CheckoutSkeleton />}>
        <CheckoutFormLoader orgId={orgId} user={user} />
      </Suspense>
    </>
  );
}

async function CheckoutFormLoader({
  orgId,
  user,
}: {
  orgId: string;
  user: User;
}) {
  const addresses = await getAddresses({ orgId });
  const cartItems = await getCartItems({ orgId });

  const isAdmin = user.role === "admin" || user.role === "orgAdmin";
  const orgUsers = isAdmin ? await getOrgUsers({ orgId }) : [];

  return (
    <CheckoutForm
      orgId={orgId}
      currentUser={user}
      addresses={addresses}
      cartItems={cartItems}
      orgUsers={orgUsers}
    />
  );
}

