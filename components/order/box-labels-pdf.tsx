import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Organization } from "@/app/generated/prisma/client";
import type { OrderWithFullDetails } from "@/data/orders";

// Define styles
const styles = StyleSheet.create({
  page: { padding: 10, flexDirection: "column", display: "flex" },
  labelContainer: {
    padding: 15,
    border: "1.5pt solid black",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  logo: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    borderBottom: "1pt solid black",
    paddingBottom: 5,
  },
  section: {
    borderBottom: "1pt solid black",
    paddingVertical: 8,
    display: "flex",
    flexDirection: "row",
  },
  sectionVertical: {
    borderBottom: "1pt solid black",
    paddingVertical: 8,
    display: "flex",
    flexDirection: "column",
  },
  labelMarker: {
    fontSize: 10,
    fontWeight: "bold",
    width: 60,
    textTransform: "uppercase",
  },
  valueText: { fontSize: 14, fontWeight: "bold", flex: 1 },
  addressLabel: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  addressValue: { fontSize: 11, lineHeight: 1.3, paddingLeft: 40 },
  boxInfo: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 10,
    borderBottom: "1pt solid black",
  },
  notesSection: { paddingVertical: 8, flex: 1 },
  notesLabel: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  notesText: { fontSize: 10, lineHeight: 1.3 },
});

interface BoxLabelsPDFProps {
  order: OrderWithFullDetails;
  organization: Organization | null;
  totalPackages: number;
}

export const BoxLabelsPDF = ({
  order,
  organization,
  totalPackages,
}: BoxLabelsPDFProps) => {
  const labels = Array.from({ length: totalPackages }, (_, i) => i + 1);

  return (
    <Document>
      {labels.map((boxNum) => (
        <Page key={boxNum} size="A6" style={styles.page}>
          <View style={styles.labelContainer}>
            <Text style={styles.logo}>PDi - ePP</Text>
            <View style={styles.section}>
              <Text style={styles.labelMarker}>Order</Text>
              <Text style={styles.valueText}>{order.reference}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.labelMarker}>Shipper</Text>
              <Text style={styles.valueText}>{organization?.name}</Text>
            </View>
            <View style={styles.sectionVertical}>
              <Text style={styles.addressLabel}>Consignee</Text>
              <View style={styles.addressValue}>
                <Text style={{ fontWeight: "bold" }}>{order.fullname}</Text>
                {order.company && <Text>{order.company}</Text>}
                <Text>{order.address1}</Text>
                {order.address2 && <Text>{order.address2}</Text>}
                <Text>
                  {order.town}
                  {order.city ? `, ${order.city}` : ""}
                </Text>
                <Text>{order.postcode}</Text>
                <Text>{order.country}</Text>
              </View>
            </View>
            <Text style={styles.boxInfo}>
              {boxNum} of {totalPackages}
            </Text>
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes</Text>
              {order.externalComments ? (
                order.externalComments
                  .split("\n")
                  .map((line: string, i: number) => (
                    <Text key={i} style={styles.notesText}>
                      {line}
                    </Text>
                  ))
              ) : (
                <Text style={styles.notesText}>No special instructions.</Text>
              )}
            </View>
          </View>
        </Page>
      ))}
    </Document>
  );
};
