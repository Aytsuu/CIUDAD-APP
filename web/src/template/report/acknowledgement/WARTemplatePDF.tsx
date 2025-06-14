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
    padding: 30,
    fontFamily: "Roboto",
  },
  header: {
    width: "53%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    marginBottom: 15,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
    justifyContent: "center",
    gap: 2,
  },
  headerText: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
  },
  tableContainer: {
    width: "100%",
    flexDirection: "column",
    border: "1px solid black",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid black",
  },
  tableHeaderCell: {
    paddingVertical: 3,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    borderRight: "1px solid black",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid black",
  },
  tableCell: {
    padding: 2,
    fontSize: 9,
    textAlign: "center",
    borderRight: "1px solid black",
  },
  // Column widths
  incidentAreaCol: {
    width: "20%",
  },
  activitiesCol: {
    width: "20%",
  },
  timeStartedCol: {
    width: "15%",
  },
  timeCompletedCol: {
    width: "15%",
  },
  resultCol: {
    width: "240px",
  },
  bottomSection: {
    flexDirection: "row",
    borderRight: "1px solid black",
    borderLeft: "1px solid black",
    borderBottom: "1px solid black",
    minHeight: 200,
  },
  crewSection: {
    width: "60%",
    borderRight: "1px solid black",
    flexDirection: "row",
  },
  crewMemberCol: {
    width: "70%",
    padding: 20,
  },
  signatureCol: {
    width: "50%",
    padding: 20,
  },
  approvalSection: {
    width: "50%",
    padding: 10,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  approvalBlock: {
    marginBottom: 40,
  },
  approvalTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 40,
  },
  approvalName: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 5,
  },
  approvalPosition: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
})

interface WARTemplatePDFProps {
  logo1?: string
  logo2?: string
  reportPeriod?: string
  tableData?: Array<{
    incident_area: string
    act_undertaken: string
    time_started: string
    time_completed: string
    result: string
  }>
  preparedBy?: string
  recommendedBy?: string
  approvedBy?: string
}

export const WARTemplatePDF: React.FC<WARTemplatePDFProps> = ({
  logo1,
  logo2,
  reportPeriod = "September 01-05, 2024",
  tableData = [],
  preparedBy = "JUNO",
  recommendedBy = "JUNO",
  approvedBy = "JUNO",
}) => (
  <Document>
    <Page size="A4" style={styles.page} orientation="landscape">
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
          <Text style={styles.headerText}>Weekly Accomplishment Report {reportPeriod}</Text>
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

      <View style={styles.tableContainer}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.incidentAreaCol]}>INCIDENT AREA</Text>
          <Text style={[styles.tableHeaderCell, styles.activitiesCol]}>ACTIVITIES UNDERTAKEN</Text>
          <Text style={[styles.tableHeaderCell, styles.timeStartedCol]}>TIME FRAME/STARTED</Text>
          <Text style={[styles.tableHeaderCell, styles.timeCompletedCol]}>TIME FRAME/COMPLETED</Text>
          <Text style={[styles.tableHeaderCell, styles.resultCol, { borderRight: "none" }]}>RESULT</Text>
        </View>

        {/* Table Body */}
        {tableData.map((row, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.incidentAreaCol]}>{row.incident_area}</Text>
            <Text style={[styles.tableCell, styles.activitiesCol]}>{row.act_undertaken}</Text>
            <Text style={[styles.tableCell, styles.timeStartedCol]}>{row.time_started}</Text>
            <Text style={[styles.tableCell, styles.timeCompletedCol]}>{row.time_completed}</Text>
            <Text style={[styles.tableCell, styles.resultCol, { borderRight: "none" }]}>{row.result}</Text>
          </View>
        ))}
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.crewSection}>
          <View style={styles.crewMemberCol}>
            <Text style={styles.sectionTitle}>CREW MEMBER</Text>
          </View>
          <View style={styles.signatureCol}>
            <Text style={styles.sectionTitle}>SIGNATURE</Text>
          </View>
        </View>

        <View style={styles.approvalSection}>
          <View style={styles.approvalBlock}>
            <Text style={styles.approvalTitle}>PREPARED BY:</Text>
            <Text style={styles.approvalName}>{preparedBy}</Text>
            <Text style={styles.approvalPosition}>TEAM LEADER</Text>
          </View>

          <View style={styles.approvalBlock}>
            <Text style={styles.approvalTitle}>RECOMMENDED BY:</Text>
            <Text style={styles.approvalName}>{recommendedBy}</Text>
            <Text style={styles.approvalPosition}>BARANGAY CAPTAIN</Text>
          </View>

          <View style={styles.approvalBlock}>
            <Text style={styles.approvalTitle}>APPROVED BY:</Text>
            <Text style={styles.approvalName}>{approvedBy}</Text>
            <Text style={styles.approvalPosition}>ASST. DEPARTMENT HEAD</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
)
