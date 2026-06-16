import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { Invoice, Order, Organization } from "@/app/generated/prisma/client";
import type { InvoiceWCharges } from "@/data/invoices";

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
  },

  // ── Orders table column widths ─────────────────────────────────────────────
  o1: { width: "5%" },
  o2: { width: "11%" },
  o3: { width: "12%" },
  o4: { width: "10%" },
  o5: { width: "24%" },
  o6: { width: "16%" },
  o8: { width: "11%", textAlign: "right" },
  o9: { width: "11%", textAlign: "right" },

  // ── Charges table column widths ────────────────────────────────────────────
  c1: { width: "5%" },
  c2: { width: "12%" },
  c3: { width: "13%" },
  c5: { width: "45%" },
  c6: { width: "13%", textAlign: "right" },
  c7: { width: "12%", textAlign: "right" },

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
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

const fmtDate = (d: Date | number | string | null | undefined) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-GB");
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
  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={s.header} fixed>
          {/* Left – Invoice Title + contact info */}
          <View style={s.headerLeft}>
            <Text style={s.invoiceTitleTop}>INVOICE</Text>
            <Text style={s.headerLeftLine}>t: 0044(0)1296 614 300</Text>
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
                  {[organization.town, organization.city].filter(Boolean).join(", ")}
                </Text>
              )}
              {organization.postcode && (
                <Text style={s.orgAddressLine}>{organization.postcode}</Text>
              )}
              {organization.country && (
                <Text style={s.orgAddressLine}>{organization.country}</Text>
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
            {invoice.poNumber && (
              <View style={s.metaLine}>
                <Text style={s.metaLabel}>PO Number:</Text>
                <Text style={s.metaValue}>{invoice.poNumber}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Orders Table ──────────────────────────────────────────────── */}
        {orders.length > 0 && (
          <View style={s.table}>
            <Text style={s.sectionHeading}>Orders</Text>
            {/* Header */}
            <View style={s.tableHeader}>
              <Text style={[s.thCell, s.o1]}>#</Text>
              <Text style={[s.thCell, s.o2]}>Date</Text>
              <Text style={[s.thCell, s.o3]}>Order Ref</Text>
              <Text style={[s.thCell, s.o4]}>PO</Text>
              <Text style={[s.thCell, s.o5]}>Consignee</Text>
              <Text style={[s.thCell, s.o6]}>Signed By</Text>
              <Text style={[s.thCell, s.o8]}>Amount</Text>
              <Text style={[s.thCell, s.o9]}>VAT</Text>
            </View>
            {/* Rows */}
            {orders.map((order, i) => (
              <View
                key={order.id}
                style={[s.tableRow, i % 2 !== 0 ? s.tableRowAlt : {}]}
                wrap={false}
              >
                <Text style={[s.tdCell, s.o1]}>{i + 1}</Text>
                <Text style={[s.tdCell, s.o2]}>{fmtDate(order.createdAt)}</Text>
                <Text style={[s.tdCell, s.o3]}>{order.reference}</Text>
                <Text style={[s.tdCell, s.o4]}>{order.poRef || "-"}</Text>
                <View style={s.o5}>
                  <Text style={s.tdCell}>{order.fullname}</Text>
                  {order.country && (
                    <Text style={[s.tdCell, { color: BLUE }]}>
                      {order.country}
                    </Text>
                  )}
                </View>
                <View style={s.o6}>
                  <Text style={s.tdCell}>{order.signedBy || "-"}</Text>
                  {order.deliveredAt && (
                    <Text style={[s.tdCell, { fontFamily: "Helvetica-Oblique", color: MID_GREY, marginTop: 1 }]}>
                      {fmtDate(order.deliveredAt)}
                    </Text>
                  )}
                </View>
                <Text style={[s.tdCell, s.o8]}>
                  {fmt(order.invoiceCost ?? order.courierCost ?? 0)}
                </Text>
                <Text style={[s.tdCell, s.o9]}>
                  {fmt(order.courierVAT ?? 0)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Additional Charges Table ──────────────────────────────────── */}
        {charges.length > 0 && (
          <View style={s.table}>
            <Text style={s.sectionHeading}>Additional Charges</Text>
            {/* Header */}
             <View style={s.tableHeader}>
              <Text style={[s.thCell, s.c1]}>#</Text>
              <Text style={[s.thCell, s.c2]}>Date</Text>
              <Text style={[s.thCell, s.c3]}>Order Ref</Text>
              <Text style={[s.thCell, s.c5]}>Description</Text>
              <Text style={[s.thCell, s.c6]}>Amount</Text>
              <Text style={[s.thCell, s.c7]}>VAT</Text>
            </View>
            {/* Rows */}
            {charges.map((charge, i) => (
              <View
                key={charge.id}
                style={[s.tableRow, i % 2 !== 0 ? s.tableRowAlt : {}]}
                wrap={false}
              >
                <Text style={[s.tdCell, s.c1]}>{i + 1}</Text>
                <Text style={[s.tdCell, s.c2]}>{fmtDate(charge.chargeDate)}</Text>
                <Text style={[s.tdCell, s.c3]}>
                  {charge.order?.reference || "-"}
                </Text>
                <Text style={[s.tdCell, s.c5]}>{charge.description}</Text>
                <Text style={[s.tdCell, s.c6]}>{fmt(charge.cost)}</Text>
                <Text style={[s.tdCell, s.c7]}>{fmt(charge.vat)}</Text>
              </View>
            ))}
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
          <Text style={s.footerText}>
            VAT Number: 923 847 601
          </Text>
          <Text style={s.footerText}>
            All goods are carried in accordance with our standard trading conditions, copies are available on request.
          </Text>
        </View>

      </Page>
    </Document>
  );
}
