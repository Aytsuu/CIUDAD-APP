import type React from "react"
import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer"

// Register fonts
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5Q.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlvAw.ttf", fontWeight: 700 },
  ],
})

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 20,
    fontFamily: "Roboto",
  },
  headerSection: {
    width: "57%",
    alignSelf: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 5,
  },
  logo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  headerTextContainer: {
    textAlign: "center",
    alignItems: "center",
    gap: 2,
  },
  headerText: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 1,
    textAlign: "center",
  },
  separator: {
    width: "100%",
    height: 1,
    backgroundColor: "#000000",
    marginVertical: 8,
  },
  titleSection: {
    width: "57%",
    alignSelf: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  titleText: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 1,
    textAlign: "center",
  },
  titleBold: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 1,
    textAlign: "center",
  },
  tableContainer: {
    width: "100%",
    flexDirection: "column",
    border: "1px solid black",
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid black",
  },
  tableHeaderCell: {
    paddingVertical: 4,
    paddingHorizontal: 2,
    fontSize: 9,
    fontWeight: 700,
    textAlign: "center",
    borderRight: "1px solid black",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid black",
    minHeight: 18,
  },
  tableCell: {
    paddingVertical: 3,
    paddingHorizontal: 2,
    fontSize: 9,
    fontWeight: 700,
    textAlign: "center",
    borderRight: "1px solid black",
    justifyContent: "center",
    alignItems: "center",
  },
  // Column widths for Plantilla table
  nameCol: {
    width: "35%",
  },
  designationCol: {
    width: "30%",
  },
  periodCol: {
    width: "20%",
  },
  rateCol: {
    width: "15%",
  },
  descriptionSection: {
    width: "100%",
    marginBottom: 10,
    alignItems: "center",
  },
  descriptionText: {
    fontSize: 9,
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: 5,
  },
  underline: {
    textDecoration: "underline",
  },
  signatureSection: {
    width: "85%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  signatureColumn: {
    width: "30%",
    flexDirection: "column",
  },
  signatureTitle: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 25,
  },
  signatureName: {
    fontSize: 9,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 3,
  },
  signaturePosition: {
    fontSize: 9,
    fontWeight: 700,
    textAlign: "center",
  },
})

interface PlantillaTemplatePDFProps {
  logo?: string
  staff?: any[]
  preparedBy?: string
  recommendedBy?: string
  approvedBy?: string
  month?: string,
  rate: number
}

export const PlantillaTemplatePDF: React.FC<PlantillaTemplatePDFProps> = ({
  logo,
  staff = [],
  preparedBy = "Not Added",
  recommendedBy = "Not Added",
  approvedBy = "Not Added",
  month = "TO BE SPECIFIED",
  rate
}) => {
  const ITEMS_PER_PAGE = 25; // Increased items per page for more compact layout
  const totalPages = Math.ceil(staff.length / ITEMS_PER_PAGE);
  
  // Create pages array
  const pages = [];
  for (let i = 0; i < totalPages; i++) {
    const startIndex = i * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    pages.push(staff.slice(startIndex, endIndex));
  }

  // If no staff, create one page with empty data
  if (pages.length === 0) {
    pages.push([]);
  }

  return (
    <Document>
      {pages.map((pageStaff, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page} orientation="landscape">
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              {logo ? (
                <Image src={logo} style={styles.logo} />
              ) : (
                <View style={[styles.logo, { backgroundColor: "#e5e7eb" }]} />
              )}
            </View>
            
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerText}>Republic of the Philippines</Text>
              <Text style={styles.headerText}>City of Cebu</Text>
              <Text style={styles.headerText}>BARANGAY SAN ROQUE (CIUDAD)</Text>
            </View>
          </View>

          <View style={styles.separator} />

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.titleBold}>PLANTILLA</Text>
            <Text style={styles.titleBold}>AUTHORITY TO SERVER</Text>
            <Text style={styles.titleText}>Personnel of the Barangay Base Responders, Barangay San Roque (Ciudad), Cebu City</Text>
          </View>

          {/* Table */}
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.nameCol]}>NAMES</Text>
              <Text style={[styles.tableHeaderCell, styles.designationCol]}>DESIGNATION</Text>
              <Text style={[styles.tableHeaderCell, styles.periodCol]}>PERIOD COVERED</Text>
              <Text style={[styles.tableHeaderCell, styles.rateCol, { borderRight: "none" }]}>RATE/AMOUNT</Text>
            </View>

            {/* Table Body */}
            {pageStaff.map((staffMember: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.nameCol]}>
                  {`${staffMember.lname}, ${staffMember.fname} ${staffMember.mname ? staffMember.mname : ''}`}
                </Text>
                <Text style={[styles.tableCell, styles.designationCol]}>BARANGAY BASE RESPONDER</Text>
                <Text style={[styles.tableCell, styles.periodCol]}>{month}</Text>
                <Text style={[styles.tableCell, styles.rateCol, { borderRight: "none" }]}>{`${rate}.00`}</Text>
              </View>
            ))}

            {/* Fill empty rows for consistent spacing */}
            {Array.from({ length: Math.max(0, 5 - pageStaff.length) }).map((_, index) => (
              <View key={`empty-${index}`} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.nameCol]}> </Text>
                <Text style={[styles.tableCell, styles.designationCol]}> </Text>
                <Text style={[styles.tableCell, styles.periodCol]}> </Text>
                <Text style={[styles.tableCell, styles.rateCol, { borderRight: "none" }]}> </Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionText}>
              List of names who have rendered services to{" "}
              <Text style={styles.underline}>Barangay San Roque (Ciudad)</Text> as Barangay
              Base Responders for the month of {month}. It shall be understood that such voluntary act will cease automatically
              if the persons will render his/her resignation.
            </Text>
          </View>

          {/* Signature Section */}
          <View style={styles.signatureSection}>
            <View style={styles.signatureColumn}>
              <Text style={styles.signatureTitle}>PREPARED BY:</Text>
              <Text style={styles.signatureName}>{preparedBy}</Text>
              <Text style={styles.signaturePosition}>TEAM LEADER</Text>
            </View>

            <View style={styles.signatureColumn}>
              <Text style={styles.signatureTitle}>RECOMMENDED BY:</Text>
              <Text style={styles.signatureName}>{recommendedBy}</Text>
              <Text style={styles.signaturePosition}>BARANGAY CAPTAIN</Text>
            </View>

            <View style={styles.signatureColumn}>
              <Text style={styles.signatureTitle}>APPROVED BY:</Text>
              <Text style={styles.signatureName}>{approvedBy}</Text>
              <Text style={styles.signaturePosition}>ASST. DEPARTMENT HEAD</Text>
            </View>
          </View>

          {/* Page number if multiple pages */}
          {totalPages > 1 && (
            <View style={{ position: "absolute", bottom: 15, right: 30 }}>
              <Text style={{ fontSize: 9, fontWeight: 700 }}>Page {pageIndex + 1} of {totalPages}</Text>
            </View>
          )}
        </Page>
      ))}
    </Document>
  );
};