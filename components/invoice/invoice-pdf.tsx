import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type {
  Invoice,
  Order,
  Organization,
} from "@/app/generated/prisma/client";
import type { InvoiceWCharges } from "@/data/invoices";
import { formattedDate } from "@/utils/formatted-date";

// ─── Colour Tokens ────────────────────────────────────────────────────────────
const BLUE = "#2B4C7E"; // Muted steel blue
const LIGHT_BLUE = "#F4F7FA"; // Soft light grey-blue
const MID_GREY = "#64748B"; // Slate grey
const DARK = "#1E293B"; // Dark slate
const LINE = "#E2E8F0"; // Subtle border line

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: DARK,
    backgroundColor: "#FFFFFF",
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: `2px solid ${BLUE}`,
    paddingBottom: 12,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "column",
    gap: 2,
  },
  headerLeftLine: {
    fontSize: 8.5,
    color: MID_GREY,
  },
  logo: {
    width: 130,
    height: 19,
    objectFit: "contain",
  },
  companyBlock: {
    alignItems: "flex-end",
    marginTop: 6,
  },
  companyName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: DARK,
  },
  companyLine: {
    fontSize: 8.5,
    color: MID_GREY,
    textAlign: "right",
  },

  // ── Invoice title & meta ──────────────────────────────────────────────────
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  invoiceTitleTop: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    letterSpacing: 2,
    marginBottom: 4,
  },
  orgAddressBlock: {
    flexDirection: "column",
  },
  orgAddressTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: MID_GREY,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  orgAddressName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    marginBottom: 2,
  },
  orgAddressLine: {
    fontSize: 8.5,
    color: MID_GREY,
  },
  orgAddressVat: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    marginTop: 4,
  },
  metaTable: {
    width: 220,
  },
  metaLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  metaLabel: {
    fontSize: 8.5,
    color: MID_GREY,
    width: 90,
  },
  metaValue: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    textAlign: "right",
    flex: 1,
  },

  // ── Section heading ───────────────────────────────────────────────────────
  sectionHeading: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  // ── Data table ────────────────────────────────────────────────────────────
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BLUE,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 2,
  },
  thCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    paddingHorizontal: 3,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottom: `1px solid ${LINE}`,
  },
  tableRowAlt: {
    backgroundColor: LIGHT_BLUE,
  },
  tdCell: {
    fontSize: 8.5,
    color: DARK,
    paddingHorizontal: 3,
  },

  // ── Unified table column widths ─────────────────────────────────────────────
  u1: { width: "4%" },
  u2: { width: "10%" },
  u3: { width: "13%" },
  u5: { width: "29%" },
  u6: { width: "5%", textAlign: "center" },
  u7: { width: "8%" },
  u8: { width: "17%" },
  u9: { width: "7%", textAlign: "right" },
  u10: { width: "7%", textAlign: "right" },

  // ── Totals ─────────────────────────────────────────────────────────────────
  totalsWrapper: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  totalsBox: {
    width: 220,
    borderTop: `2px solid ${BLUE}`,
    paddingTop: 8,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalsLabel: {
    fontSize: 9,
    color: MID_GREY,
  },
  totalsValue: {
    fontSize: 9,
    color: DARK,
  },
  totalsFinalLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: DARK,
  },
  totalsFinalValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
  },
  totalsDivider: {
    borderBottom: `1px solid ${LINE}`,
    marginVertical: 4,
  },

  // ── Notes ────────────────────────────────────────────────────────────────
  notesBox: {
    backgroundColor: LIGHT_BLUE,
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    marginBottom: 3,
  },
  notesText: {
    fontSize: 8.5,
    color: MID_GREY,
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    borderTop: `1px solid ${LINE}`,
    paddingTop: 8,
    marginTop: "auto",
  },
  footerText: {
    fontSize: 7.5,
    color: MID_GREY,
    marginBottom: 2,
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    n,
  );

const fmtDate = (d: Date | number | string | null | undefined) => {
  if (!d) return "-";
  const dateObj = d instanceof Date ? d : new Date(d);
  return formattedDate(dateObj, "short");
};

const fmtTableDate = (d: Date | number | string | null | undefined) => {
  if (!d) return "-";
  const dateObj = d instanceof Date ? d : new Date(d);
  return dateObj.toLocaleDateString("en-GB");
};

// ─── Component ────────────────────────────────────────────────────────────────
interface InvoicePDFProps {
  invoice: Invoice;
  organization: Organization | null;
  orders: Order[];
  charges: InvoiceWCharges[];
}

// react-pdf needs an absolute HTTP URL to fetch images client-side
const LOGO_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/epp-logo.png`
    : "http://localhost:3000/epp-logo.png";

export function InvoicePDF({
  invoice,
  organization,
  orders,
  charges,
}: InvoicePDFProps) {
  const items = [
    ...orders.map((o) => ({ type: "order" as const, order: o })),
    ...charges.map((c) => ({ type: "charge" as const, charge: c })),
  ];

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={s.header} fixed>
          {/* Left – Invoice Title + contact info */}
          <View style={s.headerLeft}>
            <Text style={s.invoiceTitleTop}>INVOICE</Text>
            <Text style={s.headerLeftLine}>t: 0044(0)1296 601 570</Text>
            <Text style={s.headerLeftLine}>e: accounts@pdiuk.com</Text>
          </View>

          {/* Right – logo + company address */}
          <View style={s.companyBlock}>
            <Image style={s.logo} src={LOGO_URL} />
            <View style={{ marginTop: 4 }}>
              <Text style={s.companyName}>E-PickPack Ltd trading as PDi</Text>
              <Text style={s.companyLine}>5 Rabans Lane</Text>
              <Text style={s.companyLine}>Aylesbury</Text>
              <Text style={s.companyLine}>Buckinghamshire HP19 8RT</Text>
            </View>
          </View>
        </View>

        {/* ── Recipient Address + Meta ─────────────────────────────────── */}
        <View style={s.metaRow}>
          {/* Left – Bill To Address */}
          {organization ? (
            <View style={s.orgAddressBlock}>
              <Text style={s.orgAddressTitle}>Bill To</Text>
              <Text style={s.orgAddressName}>{organization.name}</Text>
              {organization.address1 && (
                <Text style={s.orgAddressLine}>{organization.address1}</Text>
              )}
              {organization.address2 && (
                <Text style={s.orgAddressLine}>{organization.address2}</Text>
              )}
              {(organization.town || organization.city) && (
                <Text style={s.orgAddressLine}>
                  {[organization.town, organization.city]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              )}
              {organization.postcode && (
                <Text style={s.orgAddressLine}>{organization.postcode}</Text>
              )}
              {organization.country && (
                <Text style={s.orgAddressLine}>{organization.country}</Text>
              )}
              {organization.vat && (
                <Text style={s.orgAddressVat}>VAT: {organization.vat}</Text>
              )}
            </View>
          ) : (
            <View style={s.orgAddressBlock} />
          )}

          <View style={s.metaTable}>
            <View style={s.metaLine}>
              <Text style={s.metaLabel}>Invoice Number:</Text>
              <Text style={s.metaValue}>{invoice.reference}</Text>
            </View>
            <View style={s.metaLine}>
              <Text style={s.metaLabel}>Invoice Date:</Text>
              <Text style={s.metaValue}>{fmtDate(invoice.invoiceDate)}</Text>
            </View>
            {invoice.dueDate && (
              <View style={s.metaLine}>
                <Text style={s.metaLabel}>Due Date:</Text>
                <Text style={s.metaValue}>{fmtDate(invoice.dueDate)}</Text>
              </View>
            )}
            {invoice.poNumber && invoice.poNumber.trim() !== "" && (
              <View style={s.metaLine}>
                <Text style={s.metaLabel}>PO Number:</Text>
                <Text style={s.metaValue}>{invoice.poNumber}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Unified Items Table ───────────────────────────────────────── */}
        {items.length > 0 && (
          <View style={s.table}>
            {/* Header */}
            <View style={s.tableHeader}>
              <Text style={[s.thCell, s.u1]}>#</Text>
              <Text style={[s.thCell, s.u2]}>Date</Text>
              <Text style={[s.thCell, s.u3]}>Order Ref</Text>
              <Text style={[s.thCell, s.u6]}>Pcs</Text>
              <Text style={[s.thCell, s.u7]}>Wgt(Kgs)</Text>
              <Text style={[s.thCell, s.u5]}>Consignee</Text>
              <Text style={[s.thCell, s.u8]}>Signed By</Text>
              <Text style={[s.thCell, s.u9]}>Amount</Text>
              <Text style={[s.thCell, s.u10]}>VAT</Text>
            </View>
            {/* Rows */}
            {items.map((item, i) => {
              const isEven = i % 2 !== 0;
              if (item.type === "order") {
                const order = item.order;
                return (
                  <View
                    key={`order-${order.id}`}
                    style={[s.tableRow, isEven ? s.tableRowAlt : {}]}
                    wrap={false}
                  >
                    <Text style={[s.tdCell, s.u1]}>{i + 1}</Text>
                    <Text style={[s.tdCell, s.u2]}>
                      {fmtTableDate(order.createdAt)}
                    </Text>
                    <View style={s.u3}>
                      <Text style={s.tdCell}>{order.reference}</Text>
                      {order.poRef && (
                        <Text
                          style={[
                            s.tdCell,
                            { color: MID_GREY, fontSize: 7.5, marginTop: 1 },
                          ]}
                        >
                          PO: {order.poRef}
                        </Text>
                      )}
                    </View>
                    <Text style={[s.tdCell, s.u6]}>
                      {order.totalPackages ?? 1}
                    </Text>
                    <Text style={[s.tdCell, s.u7]}>
                      {order.weight
                        ? `${(order.weight / 1000).toFixed(2)}`
                        : "0.00"}
                    </Text>
                    <View style={s.u5}>
                      <Text style={s.tdCell}>{order.fullname}</Text>
                      {order.country && (
                        <Text
                          style={[
                            s.tdCell,
                            { color: BLUE, fontFamily: "Helvetica-Bold" },
                          ]}
                        >
                          {order.country}
                        </Text>
                      )}
                      <Text
                        style={[
                          s.tdCell,
                          { color: MID_GREY, fontSize: 7.5, marginTop: 1 },
                        ]}
                      >
                        {order.description || "Printed Matter"}
                      </Text>
                    </View>
                    <View style={s.u8}>
                      <Text style={s.tdCell}>{order.signedBy || "-"}</Text>
                      {order.deliveredAt && (
                        <Text
                          style={[
                            s.tdCell,
                            {
                              fontFamily: "Helvetica-Oblique",
                              color: MID_GREY,
                              marginTop: 1,
                            },
                          ]}
                        >
                          {fmtTableDate(order.deliveredAt)}
                        </Text>
                      )}
                    </View>
                    <Text style={[s.tdCell, s.u9]}>
                      {fmt(order.invoiceCost ?? order.courierCost ?? 0)}
                    </Text>
                    <Text style={[s.tdCell, s.u10]}>
                      {fmt(order.courierVAT ?? 0)}
                    </Text>
                  </View>
                );
              } else {
                const charge = item.charge;
                return (
                  <View
                    key={`charge-${charge.id}`}
                    style={[s.tableRow, isEven ? s.tableRowAlt : {}]}
                    wrap={false}
                  >
                    <Text style={[s.tdCell, s.u1]}>{i + 1}</Text>
                    <Text style={[s.tdCell, s.u2]}>
                      {fmtTableDate(charge.chargeDate)}
                    </Text>
                    <View style={s.u3}>
                      <Text style={s.tdCell}>
                        {charge.order?.reference || "-"}
                      </Text>
                      {charge.order?.poRef && (
                        <Text
                          style={[
                            s.tdCell,
                            { color: MID_GREY, fontSize: 7.5, marginTop: 1 },
                          ]}
                        >
                          PO: {charge.order?.poRef}
                        </Text>
                      )}
                    </View>
                    <Text style={[s.tdCell, s.u6]}>-</Text>
                    <Text style={[s.tdCell, s.u7]}>-</Text>
                    <Text style={[s.tdCell, s.u5]}>{charge.description}</Text>
                    <Text style={[s.tdCell, s.u8]}>-</Text>
                    <Text style={[s.tdCell, s.u9]}>{fmt(charge.cost)}</Text>
                    <Text style={[s.tdCell, s.u10]}>{fmt(charge.vat)}</Text>
                  </View>
                );
              }
            })}
          </View>
        )}

        {/* ── Totals ────────────────────────────────────────────────────── */}
        <View style={s.totalsWrapper}>
          <View style={s.totalsBox}>
            <View style={s.totalsRow}>
              <Text style={s.totalsLabel}>Subtotal:</Text>
              <Text style={s.totalsValue}>{fmt(invoice.subtotalCost)}</Text>
            </View>
            <View style={s.totalsRow}>
              <Text style={s.totalsLabel}>VAT:</Text>
              <Text style={s.totalsValue}>{fmt(invoice.vatCost)}</Text>
            </View>
            <View style={s.totalsDivider} />
            <View style={s.totalsRow}>
              <Text style={s.totalsFinalLabel}>Total Due GBP:</Text>
              <Text style={s.totalsFinalValue}>{fmt(invoice.totalCost)}</Text>
            </View>
          </View>
        </View>

        {/* ── Invoice Notes ─────────────────────────────────────────────── */}
        {invoice.invoiceNotes && (
          <View style={s.notesBox}>
            <Text style={s.notesLabel}>Notes</Text>
            <Text style={s.notesText}>{invoice.invoiceNotes}</Text>
          </View>
        )}

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            Terms of Payment: 30 DAYS FROM INVOICE DATE
          </Text>
          <Text style={s.footerText}>VAT Number: 923 847 601</Text>
          <Text style={s.footerText}>
            All goods are carried in accordance with our standard trading
            conditions, copies are available on request.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
