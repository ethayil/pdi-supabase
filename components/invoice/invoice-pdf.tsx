import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Invoice, Order } from "@/app/generated/prisma/client";
import type { InvoiceWCharges } from "@/data/invoices";

// Register fonts if needed
// Font.register({
//   family: "Roboto",
//   src: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
// });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: 1,
  },
  companyInfo: {
    fontSize: 9,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  label: {
    fontWeight: "bold",
    width: "40%",
  },
  value: {
    width: "60%",
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: 1,
    paddingBottom: 5,
    marginBottom: 5,
    fontWeight: "bold",
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    fontSize: 9,
  },
  col1: { width: "4%", marginRight: 4 },
  col2: { width: "10%", marginRight: 4 },
  col3: { width: "13%", marginRight: 4 },
  col4: { width: "10%", marginRight: 4 },
  col5: { width: "20%", marginRight: 4 },
  col6: { width: "13%", marginRight: 4 },
  col7: { width: "13%", marginRight: 4 },
  col8: { width: "10%" },
  totals: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: 1,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 5,
  },
  totalLabel: {
    width: 100,
    textAlign: "right",
    marginRight: 10,
  },
  totalValue: {
    width: 100,
    textAlign: "right",
  },
  footer: {
    marginTop: 30,
    fontSize: 8,
    color: "#666",
  },
});

interface InvoicePDFProps {
  invoice: Invoice;
  orders: Order[];
  charges: InvoiceWCharges[];
}

export function InvoicePDF({ invoice, orders, charges }: InvoicePDFProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const formatDate = (date: Date | number | string) => {
    return new Date(date).toLocaleDateString("en-GB");
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text>e-PickPack Ltd trading as PDi</Text>
            <Text>5 Rabans Lane</Text>
            <Text>Aylesbury</Text>
            <Text>HP19 8RT</Text>
          </View>
          <View>
            <Text style={{ fontSize: 12, fontWeight: "bold" }}>
              e-PickPack Ltd
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>INVOICE</Text>

        {/* Invoice Details */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice Number:</Text>
            <Text style={styles.value}>{invoice.reference}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice Date:</Text>
            <Text style={styles.value}>{formatDate(invoice.invoiceDate)}</Text>
          </View>
          {invoice.dueDate && (
            <View style={styles.row}>
              <Text style={styles.label}>Due Date:</Text>
              <Text style={styles.value}>{formatDate(invoice.dueDate)}</Text>
            </View>
          )}
          {invoice.poNumber && (
            <View style={styles.row}>
              <Text style={styles.label}>PO Number:</Text>
              <Text style={styles.value}>{invoice.poNumber}</Text>
            </View>
          )}
        </View>

        {/* Orders Table */}
        {orders.length > 0 && (
          <View style={styles.table}>
            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Orders</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>#</Text>
              <Text style={styles.col2}>Date</Text>
              <Text style={styles.col3}>Order#</Text>
              <Text style={styles.col4}>PO</Text>
              <Text style={styles.col5}>Consignee</Text>
              <Text style={styles.col6}>Signed By</Text>
              <Text style={styles.col7}>Delivery</Text>
              <Text style={styles.col8}>Amount</Text>
            </View>
            {orders.map((order, index: number) => (
              <View key={order.id} style={styles.tableRow}>
                <Text style={styles.col1}>{index + 1}</Text>
                <Text style={styles.col2}>{formatDate(order.createdAt)}</Text>
                <Text style={styles.col3}>{order.reference}</Text>
                <Text style={styles.col4}>{order.poRef || "-"}</Text>
                <Text style={styles.col5}>
                  {order.fullname}
                  {order.country && `\n${order.country}`}
                </Text>
                <Text style={styles.col6}>{order.signedBy || "-"}</Text>
                <Text style={styles.col7}>
                  {order.deliveredAt ? formatDate(order.deliveredAt) : "-"}
                </Text>
                <Text style={styles.col8}>
                  {formatCurrency(
                    order.invoiceCost ?? (order.courierCost || 0),
                  )}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Charges Table */}
        {charges.length > 0 && (
          <View style={styles.table}>
            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
              Additional Charges
            </Text>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>#</Text>
              <Text style={styles.col2}>Date</Text>
              <Text style={styles.col3}>Order Ref</Text>
              <Text style={styles.col4}>Type</Text>
              <Text style={styles.col5}>Description</Text>
              <Text style={styles.col7}>Amount</Text>
              <Text style={styles.col8}>VAT</Text>
            </View>
            {charges.map((charge, index: number) => (
              <View key={charge.id} style={styles.tableRow}>
                <Text style={styles.col1}>{index + 1}</Text>
                <Text style={styles.col2}>{formatDate(charge.chargeDate)}</Text>
                <Text style={styles.col3}>
                  {charge.order?.reference || "-"}
                </Text>
                <Text style={styles.col4}>
                  {charge.chargeType.replace(/_/g, " ")}
                </Text>
                <Text style={styles.col5}>{charge.description}</Text>
                <Text style={styles.col7}>{formatCurrency(charge.cost)}</Text>
                <Text style={styles.col8}>{formatCurrency(charge.vat)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.subtotalCost)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>VAT:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.vatCost)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text
              style={[styles.totalLabel, { fontWeight: "bold", fontSize: 12 }]}
            >
              Total Due GBP:
            </Text>
            <Text
              style={[styles.totalValue, { fontWeight: "bold", fontSize: 12 }]}
            >
              {formatCurrency(invoice.totalCost)}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.invoiceNotes && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Notes:</Text>
            <Text style={{ fontSize: 9 }}>{invoice.invoiceNotes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Terms of Payment: 30 DAYS FROM INVOICE DATE</Text>
          <Text>
            All goods are carried in accordance with our standard trading
            conditions, copies are available on request.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
