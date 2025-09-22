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
    padding: 40,
    fontFamily: "Roboto",
  },
  headerSection: {
    width: "95%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
  },
  logo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  headerTextContainer: {
    textAlign: "center",
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 10,
  },
  headerText: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 1,
    textAlign: "center",
  },
  titleSection: {
    width: "80%",
    alignSelf: "center",
    marginBottom: 15,
  },
  titleText: {
    fontSize: 10,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 8,
  },
  certificationText: {
    fontSize: 10,
    fontWeight: 700,
    textAlign: "justify",
    lineHeight: 1.3,
    marginBottom: 12,
  },
  nameListSection: {
    width: "80%",
    alignSelf: "center",
    marginBottom: 12,
  },
  nameListHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  nameColumn: {
    width: "50%",
    textAlign: "center",
    fontSize: 10,
    fontWeight: 700,
  },
  signatureColumn: {
    width: "50%",
    textAlign: "center",
    fontSize: 10,
    fontWeight: 700,
  },
  nameListBody: {
    flexDirection: "column",
  },
  nameRow: {
    flexDirection: "row",
    marginBottom: 4,
    minHeight: 15,
  },
  nameText: {
    width: "50%",
    fontSize: 10,
    fontWeight: 700,
    paddingRight: 10,
  },
  signatureLine: {
    width: "50%",
    fontSize: 10,
    fontWeight: 700,
    textAlign: "center",
    paddingLeft: 20,
  },
  closingText: {
    fontSize: 10,
    fontWeight: 700,
    textAlign: "justify",
    lineHeight: 1.3,
    marginBottom: 15,
    width: "80%",
    alignSelf: "center",
  },
  signatureSection: {
    width: "80%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  signatureCol: {
    width: "30%",
    flexDirection: "column",
  },
  signatureTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 20,
  },
  signatureName: {
    fontSize: 10,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 3,
  },
  signaturePosition: {
    fontSize: 10,
    fontWeight: 700,
    textAlign: "center",
  },
})

interface CertificationTemplatePDFProps {
  logo1?: string
  logo2?: string
  staff?: any[]
  preparedBy?: string
  recommendedBy?: string
  approvedBy?: string
  month?: string
  year?: number
}

export const CertTemplatePDF: React.FC<CertificationTemplatePDFProps> = ({
  logo1,
  logo2,
  staff = [],
  preparedBy = "Not Added",
  recommendedBy = "Not Added",
  approvedBy = "Not Added",
  month = "JANUARY 2025",
}) => {
  const ITEMS_PER_PAGE = 20; // More items per page for compact PDF
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
        <Page key={pageIndex} size="LEGAL" orientation="landscape" style={styles.page}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              {logo1 ? (
                <Image src={logo1} style={styles.logo} />
              ) : (
                <View style={[styles.logo, { backgroundColor: "#e5e7eb" }]} />
              )}
            </View>
            
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerText}>REPUBLIC OF THE PHILIPPINES</Text>
              <Text style={styles.headerText}>CITY OF CEBU</Text>
              <Text style={styles.headerText}>CEBU CITY DISASTER RISK REDUCTION MANAGEMENT OFFICE</Text>
              <Text style={styles.headerText}>BARANGAY SAN ROQUE (CIUDAD)</Text>
            </View>

            <View style={styles.logoContainer}>
              {logo2 ? (
                <Image src={logo2} style={styles.logo} />
              ) : (
                <View style={[styles.logo, { backgroundColor: "#e5e7eb" }]} />
              )}
            </View>
          </View>

          {/* Title and Description */}
          <View style={styles.titleSection}>
            <Text style={styles.titleText}>CERTIFICATION</Text>
            <Text style={styles.certificationText}>
              This is to certify that the following names listed below are the BARANGAY BASE RESPONDERS OF BARANGAY SAN ROQUE (CIUDAD)
              satisfactory rendered their services.
            </Text>
          </View>

          {/* Name List */}
          <View style={styles.nameListSection}>
            {/* Header */}
            <View style={styles.nameListHeader}>
              <Text style={styles.nameColumn}>NAMES</Text>
              <Text style={styles.signatureColumn}>SIGNATURE</Text>
            </View>

            {/* Body */}
            <View style={styles.nameListBody}>
              {pageStaff.map((member: any, index: number) => {
                const globalIndex = pageIndex * ITEMS_PER_PAGE + index;
                return (
                  <View key={index} style={styles.nameRow}>
                    <Text style={styles.nameText}>
                      {`${globalIndex + 1}. ${member.lname.toUpperCase()}, ${member.fname.toUpperCase()} ${member.mname ? member.mname.toUpperCase() : ''}`}
                    </Text>
                    <Text style={styles.signatureLine}>
                      ______________________________
                    </Text>
                  </View>
                );
              })}

            </View>
          </View>

          {/* Closing Text */}
          <View>
            <Text style={styles.closingText}>
              This certification is issued upon the request set forth by the office of the Barangay Base Responders for the month of {month}.
            </Text>
          </View>

          {/* Signature Section */}
          <View style={styles.signatureSection}>
            <View style={styles.signatureCol}>
              <Text style={styles.signatureTitle}>PREPARED BY:</Text>
              <Text style={styles.signatureName}>{preparedBy}</Text>
              <Text style={styles.signaturePosition}>TEAM LEADER</Text>
            </View>

            <View style={styles.signatureCol}>
              <Text style={styles.signatureTitle}>RECOMMENDED BY:</Text>
              <Text style={styles.signatureName}>{recommendedBy}</Text>
              <Text style={styles.signaturePosition}>BARANGAY CAPTAIN</Text>
            </View>

            <View style={styles.signatureCol}>
              <Text style={styles.signatureTitle}>APPROVED BY:</Text>
              <Text style={styles.signatureName}>{approvedBy}</Text>
              <Text style={styles.signaturePosition}>ASST. DEPARTMENT HEAD</Text>
            </View>
          </View>

          {/* Page number if multiple pages */}
          {totalPages > 1 && (
            <View style={{ position: "absolute", bottom: 15, right: 30 }}>
              <Text style={{ fontSize: 10, fontWeight: 700 }}>Page {pageIndex + 1} of {totalPages}</Text>
            </View>
          )}
        </Page>
      ))}
    </Document>
  );
};