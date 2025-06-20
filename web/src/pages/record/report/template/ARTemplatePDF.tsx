import type React from "react"
import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer"

// Register fonts (optional - you can use default fonts if preferred)
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
    padding: 30,
    fontFamily: "Roboto",
  },
  header: {
    width: "53%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    marginBottom: 10,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 48,
    overflow: "hidden",
  },
  logo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  headerTextContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },
  separator: {
    height: 1,
    backgroundColor: "#000000",
    width: "100%",
    marginTop: 5,
  },
  title: {
    fontSize: 12,
    fontWeight: 550,
    marginVertical: 5,
    textAlign: "center",
  },
  detailsContainer: {
    width: "100%",
    marginBottom: 5,
  },
  detailRow: {
    fontSize: 12,
    fontWeight: 550,
    marginBottom: 5,
  },
  imagesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginVertical: 5,
  },
  image: {
    width: 250,
    height: 220,
    backgroundColor: "#e5e7eb",
  },
  signMainContaniner: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center"
  },
  signaturesContainer: {
    width: "85%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  signatureTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 25,
  },
  signatureName: {
    fontSize: 12,
    marginBottom: 5,
  },
  signaturePosition: {
    fontSize: 12,
    fontWeight: "bold",
  },
})

interface ARTemplatePDFProps {
  logo1?: string
  logo2?: string
  incidentName?: string
  dateTime?: string
  location?: string
  actionsTaken?: string 
  images?: any[]
  preparedBy?: string
  recommendedBy?: string
  approvedBy?: string
}

export const ARTemplatePDF: React.FC<ARTemplatePDFProps> = ({
  logo1,
  logo2,
  incidentName = "",
  dateTime = "",
  location = "",
  actionsTaken = "",
  images = [],
  preparedBy = "Juno",
  recommendedBy = "Juno",
  approvedBy = "Juno",
}) => (
  <Document>
    <Page size="LEGAL" orientation="landscape" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {logo1 ? (
            <Image src={logo1 || "/placeholder.svg"} style={styles.logo} />
          ) : (
            <View style={[styles.logo, { backgroundColor: "#e5e7eb" }]} />
          )}
        </View>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>REPUBLIC OF THE PHILIPPINES</Text>
          <Text style={styles.headerText}>CITY OF CEBU</Text>
          <Text style={styles.headerText}>CEBU CITY DISASTER RISK REDUCTION MANAGEMENT OFFICE</Text>
          <Text style={styles.headerText}>BARANGAY BASE RESPONDERS</Text>
          <Text style={styles.headerText}>BARANGAY SAN ROQUE (CIUDAD)</Text>
        </View>

        <View style={styles.logoContainer}>
          {logo2 ? (
            <Image src={logo2 || "/placeholder.svg"} style={styles.logo} />
          ) : (
            <View style={[styles.logo, { backgroundColor: "#e5e7eb" }]} />
          )}
        </View>
      </View>

      <View style={styles.separator} />

      <Text style={styles.title}>ACTION PHOTO REPORTS</Text>

      <View style={styles.detailsContainer}>
        <Text style={styles.detailRow}>NAME OF INCIDENT OR ACTIVITY: 
          <Text style={{fontWeight: 400}}> {incidentName}</Text>
        </Text>
        <Text style={styles.detailRow}>DATE & TIME: 
          <Text style={{fontWeight: 400}}> {dateTime}</Text>
        </Text>
        <Text style={styles.detailRow}>LOCATION: 
          <Text style={{fontWeight: 400}}> {location}</Text>
        </Text>
        <Text style={styles.detailRow}>ACTIONS TAKEN: 
          <Text style={{fontWeight: 400}}> {actionsTaken}</Text>
        </Text>
      </View>

      <View style={styles.imagesContainer}>
        {images.map((img, index) => (
          <View key={index} style={styles.image}>
              <Image src={img.arf_url || "/placeholder.svg"} style={{ width: "100%", height: "100%" }} />
          </View>
        ))}
      </View>

      <View style={styles.signMainContaniner}>
        <View style={styles.signaturesContainer}>
          <View>
            <Text style={styles.signatureTitle}>PREPARED BY:</Text>
            <Text style={styles.signatureName}>{preparedBy}</Text>
            <Text style={styles.signaturePosition}>TEAM LEADER</Text>
          </View>

          <View>
            <Text style={styles.signatureTitle}>RECOMMENDED BY:</Text>
            <Text style={styles.signatureName}>{recommendedBy}</Text>
            <Text style={styles.signaturePosition}>BARANGAY CAPTAIN</Text>
          </View>

          <View>
            <Text style={styles.signatureTitle}>APPROVED BY:</Text>
            <Text style={styles.signatureName}>{approvedBy}</Text>
            <Text style={styles.signaturePosition}>ASST. DEPARTMENT HEAD</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
)
